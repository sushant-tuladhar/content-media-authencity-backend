const Joi = require('@hapi/joi');
const {
    User,
    UserLoginHistory
} = require('../../models/user/user');
const bcrypt = require('bcrypt');
const nodemailer=require('nodemailer');

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