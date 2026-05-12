const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models/user/user');

passport.serializeUser((user, done) => {
    done(null, user.id || user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        if (!email) {
            return done(new Error('Google account did not return an email address'));
        }

        let user = await User.findOne({ $or: [{ googleId: profile.id }, { email: email }] });

        if (!user) {
            user = new User({
                first_name: profile.name && profile.name.givenName ? profile.name.givenName : 'Google',
                last_name: profile.name && profile.name.familyName ? profile.name.familyName : 'User',
                email: email,
                isEmailVerified: true,
                authProvider: 'google',
                googleId: profile.id
            });
        } else {
            user.googleId = user.googleId || profile.id;
            user.authProvider = 'google';
            user.isEmailVerified = true;
        }

        await user.save();
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

module.exports = passport;