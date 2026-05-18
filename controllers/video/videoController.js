const fs = require('fs');
const crypto = require('crypto');
const Joi = require('joi');
const Video = require('../../models/video/video');
const { extractVideoMetadata } = require('../../utils/metadataExtractor');
const { uploadLargeFileToS3 } = require('../../utils/s3Uploader');

/**
 * Get videos uploaded by a specific user
 * @param {*} req 
 * @param {*} res 
 */
exports.getUserVideos = async (req,res)=>{
    const userId = req.user.userId; // Securely reading from the authenticated session (JWT payload uses userId)
    try {
        const videos = await Video.find({ userId: userId });
        res.status(200).json({ videos: videos });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

/**
 * Upload a new video
 * @param {*} req 
 * @param {*} res 
 */
exports.uploadVideo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No video file provided." });
        }

        const schema = Joi.object({
            title: Joi.string().trim().required().messages({
                'string.empty': 'Title is required.',
                'any.required': 'Title is required.'
            }),
            description: Joi.string().trim().required().messages({
                'string.empty': 'Description is required.',
                'any.required': 'Description is required.'
            })
        });

        console.log(`[Upload] Received upload request from authenticated user: ${req.user.userId}`);

        // IMPORTANT: stripUnknown tells Joi to ignore fields like 'user_id' if they are sent by mistake!
        const { error, value } = schema.validate(req.body, { stripUnknown: true });
        if (error) {
            console.error(`[Upload] Validation failed:`, error.details[0].message);
            // Cleanup local file on validation error
            await fs.promises.unlink(req.file.path).catch(console.error);
            return res.status(400).json({ error: error.details[0].message });
        }

        const { title, description } = value;
        console.log(`[Upload] Validation passed. Title: "${title}"`);
        let videoId = null;

        // 0. Create initial database record in 'processing' state
        console.log(`[Upload] Creating initial DB record in processing state...`);
        const video = new Video({
            title,
            description,
            original_filename: req.file.originalname,
            mime_type: req.file.mimetype,
            file_size: req.file.size,
            userId: req.user.userId,
            upload_status: 'processing'
        });
        await video.save();
        videoId = video._id;
        console.log(`[Upload] Saved initial DB record: ${videoId}`);

        // 1. Setup Stream for Hashing & S3 Upload
        console.log(`[Upload] Starting parallel hashing, metadata extraction, and S3 upload...`);
        const hashStream = fs.createReadStream(req.file.path);
        const uploadStream = fs.createReadStream(req.file.path);
        const hashSum = crypto.createHash('sha256');
        
        // As the stream flows to S3, calculate the hash
        hashStream.on('data', chunk => hashSum.update(chunk));

        // 2 & 3. Run Metadata Extraction and S3 Upload in parallel
        const [metadata, s3Result] = await Promise.all([
            extractVideoMetadata(req.file.path),
            uploadLargeFileToS3(uploadStream, req.file.originalname, req.file.mimetype)
        ]);
        
        const sha256_hash = hashSum.digest('hex');

        // 4. Update Database with Success
        console.log(`[Upload] Processing finished! S3 URL: ${s3Result.url}, Hash: ${sha256_hash}`);
        console.log(`[Upload] Updating database record to completed...`);
        video.url = s3Result.url;
        video.s3_key = s3Result.s3_key;
        video.sha256_hash = sha256_hash;
        video.metadata = metadata;
        video.upload_status = 'completed';
        await video.save();

        // 5. Cleanup local file
        console.log(`[Upload] Cleaning up temp local file...`);
        if (req.file) {
            await fs.promises.unlink(req.file.path).catch(console.error);
        }

        console.log(`[Upload] Sequence finished successfully!`);
        res.status(201).json({ message: "Video uploaded successfully", video });
    } catch (error) {
        if (req.file) {
            await fs.promises.unlink(req.file.path).catch(console.error);
        }
        
        // If we created a video document but failed midway, mark it as failed
        if (typeof videoId !== 'undefined' && videoId) {
            await Video.findByIdAndUpdate(videoId, { upload_status: 'failed' }).catch(console.error);
        }

        console.error('Video upload error:', error);
        res.status(500).json({ error: "An error occurred while uploading the video.", details: error.message });
    }
};
