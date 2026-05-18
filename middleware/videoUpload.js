const multer = require('multer');
const fs = require('fs');

const uploadDir = 'uploads/';
fs.mkdirSync(uploadDir, { recursive: true });

// Configure Multer for a 500MB limit
const upload = multer({ 
    dest: uploadDir,
    limits: { 
        fileSize: 500 * 1024 * 1024 // 500MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('INVALID_FILE_TYPE'), false);
        }
    }
});

// Catch Multer errors gracefully
const uploadMiddleware = (req, res, next) => {
    upload.single('videoFile')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(413).json({ error: "File too large. Maximum size is 500MB." });
            }
            return res.status(400).json({ error: err.message });
        } else if (err) {
            if (err.message === 'INVALID_FILE_TYPE') {
                return res.status(415).json({ error: "Please upload only video files." });
            }
            return res.status(500).json({ error: err.message });
        }
        next();
    });
};

module.exports = { uploadMiddleware };
