require('dotenv').config();
const Joi = require('joi');
const {
    User,
    UserLoginHistory
} = require('../../models/user/user');
const bcrypt = require('bcrypt');
const nodemailer=require('nodemailer');
const jwt= require('jsonwebtoken');

/**
 * Registers a new user.
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.registerUser= async (req,res)=>{
    if(req.body ==undefined){
        return res.status(400).json({ error: "Invalid request body" });
    }

    const registerSchema = Joi.object({
        first_name: Joi.string().min(2).max(100).required(),
        last_name: Joi.string().min(2).max(100).required(),
        email: Joi.string().email().required(),
        dob: Joi.date().max('now').required(),
        phone: Joi.string().min(10).max(15).required(),
        password: Joi.string().min(8).required()
    });
    const { error } = registerSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = new User({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            dob: req.body.dob,
            phone: req.body.phone,
            password: hashedPassword
        });

        await newUser.save();
        await welcomeEmail(newUser.email);
        return res.status(201).json({ message: "User registered successfully", user: newUser });
    } catch (err) {
        return res.status(500).json({ error: "Error registering user", details: err.message || err });
    }
};

/**
 * Sends a welcome email to the new user.
 * @param {*} userEmail The email address of the user which we need to send the email
 */
async function welcomeEmail(userEmail){
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: 'Welcome to Our Service',
        text: 'Thank you for registering! We are excited to have you on board.'
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

/**
 * Handles user login.
 * @param {*} req has the email and password in the body of the request
 * @param {*} res 
 * @returns 
 */
exports.login= async (req,res)=>{
    const schema=Joi.object({
        email:Joi.string().email().required(),
        password:Joi.string().min(6).max(12).required()
    })

    if (!req.body) {
        return res.status(400).json({ error: "Invalid request body" });
    }

    // validate request body
    const { error } = schema.validate(req.body)
    if (error) {
        return res.status(400).json({ error: error.details[0].message })
    }
    
    // Authenticate users here
    try{
        const userRes = await User.findOne({ email: req.body.email });
        if (!userRes) return res.status(400).json({ error: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(req.body.password, userRes.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

        const isActive = userRes.isActive === true;
        if (!isActive) return res.status(403).json({ error: 'Your account is inactive. Please contact support.' });

        // If login is successful, set user session and respond
        req.session.user = userRes; // Store user info in session

        const payload = ({
            userId: userRes._id,
            email: userRes.email,
            isAdmin: userRes.isAdmin
        });
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        await userLoginHistory(userRes._id, req.ip);
        return res.status(200).json({ message: 'Login successful', user: userRes, token: 'Bearer ' + token });
    }
    catch (err){
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

exports.googleLoginSuccess = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Google authentication failed' });
    }

    try {
        req.session.user = req.user;

        const payload = ({
            userId: req.user._id,
            email: req.user.email,
            isAdmin: req.user.isAdmin
        });

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        await userLoginHistory(req.user._id, req.ip);

        return res.status(200).json({
            message: 'Google login successful',
            user: req.user,
            token: 'Bearer ' + token
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

async function userLoginHistory(userId, ip){
    const userLoginHistory = new UserLoginHistory({
        userId: userId,
        loginTime: new Date(),
        ipAddress: ip
    });
    await userLoginHistory.save();
}