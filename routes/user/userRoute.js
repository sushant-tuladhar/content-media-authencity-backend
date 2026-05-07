const express=require('express');
const {
    getUserProfile,
    updateProfile
} = require('../../controllers/user/userController');
const { getUserVideos } = require('../../controllers/video/videoController');
const {
    isAuthenticated
} = require('../../middleware/auth');   

const router=express.Router();

//Get the user profile
router.get('/api/user/:id', isAuthenticated, async (req, res) => {
    await getUserProfile(req, res);
});

//Update the user profile
router.put('/api/user/:id', isAuthenticated, async (req, res) => {
    await updateProfile(req, res);
});


//Get the user videos
router.get('/api/videos', isAuthenticated, async(req,res)=>{
    console.log("Fetching videos for user with data:", req.body);
    await getUserVideos(req,res);
});
module.exports = router;
