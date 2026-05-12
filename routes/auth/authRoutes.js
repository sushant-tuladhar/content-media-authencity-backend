const express= require('express');
const passport = require('passport');
const { registerUser, login, googleLoginSuccess }= require('../../controllers/auth/authController.js');

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

router.get('/api/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/api/auth/google/callback', (req, res, next) => {
    passport.authenticate('google', { session: true }, async (err, user, info) => {
        if (err) {
            return next(err);
        }

        if (!user) {
            return res.status(401).json({
                error: 'Google authentication failed',
                details: info && info.message ? info.message : 'No user returned'
            });
        }

        req.logIn(user, async (loginErr) => {
            if (loginErr) {
                return next(loginErr);
            }

            req.user = user;
            await googleLoginSuccess(req, res);
        });
    })(req, res, next);
});

module.exports = router;

