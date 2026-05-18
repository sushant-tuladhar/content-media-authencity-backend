const express = require('express');
const router = express.Router();
const { uploadVideo } = require('../../controllers/video/videoController');
const { isAuthenticated } = require('../../middleware/auth');   
const { uploadMiddleware } = require('../../middleware/videoUpload');

router.post('/api/videos/upload', isAuthenticated, uploadMiddleware, uploadVideo);

module.exports = router;