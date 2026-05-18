const Video=require('../../models/video/video');

/**
 * Get videos uploaded by a specific user
 * @param {*} req 
 * @param {*} res 
 */
exports.getUserVideos = async (req,res)=>{
    const userId = req.body.user_id;
    try {
        const videos = await Video.find({ user: userId });
        res.status(200).json({ videos: videos });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
