const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const fs = require('fs');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const uploadLargeFileToS3 = async (fileStream, originalFilename, mimeType) => {
    const uniqueFileName = `${Date.now()}-${originalFilename}`;

    const uploader = new Upload({
        client: s3Client,
        params: {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: `videos/${uniqueFileName}`,
            Body: fileStream,
            ContentType: mimeType
        },
        queueSize: 4, 
        partSize: 5 * 1024 * 1024 // 5MB chunks
    });

    const result = await uploader.done();
    return {
        url: result.Location,
        s3_key: `videos/${uniqueFileName}`
    };
};

module.exports = { uploadLargeFileToS3 };
