const express= require('express');
const { registerUser, login }= require('../../controllers/auth/authController.js');

const router = express.Router();

//For register
router.post('/api/register', async (req, res) => {
    console.log("Registering user with data:", req.body);
    await registerUser(req, res);
});

//For login
router.post('/api/login', async (req, res) => {
    console.log("Logging in user with data:", req.body);
    await login(req, res);
});

module.exports = router;

