const express= require('express');
const { User } = require('../../models/user/user');


/**
 * Fetches the user profile for a given user ID.
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.getUserProfile= async (req,res)=>{
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        return res.status(200).json({ user });
    } catch (error) {
        return res.status(500).json({ error: "Error fetching user profile", details: error.message });
    }
};
