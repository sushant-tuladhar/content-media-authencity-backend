const mongoose= require('mongoose');

const userSchema= mongoose.Schema({
     first_name: { type: String, required: true },
     last_name: { type: String, required: true },
     email: { type: String, required: true, unique: true },
     dob: { type: Date, required: true, default: '0000-00-00' },
     phone: { type: Number, required: true, maxLength: 15, minLength: 10 },
     password: { type: String, required: true, minLength: 8 },
     createdAt: { type: Date, default: Date.now },
     isAdmin: { type: Boolean, default: false },
     isActive: { type: Boolean, default: true },
     isAdminVerified: { type: Boolean, default: false },
     isEmailVerified: { type: Boolean, default: false },
     lastLogin: { type: Date, default: Date.now },
     isDeleted: { type: Boolean, default: false },
    //  token: { type: String, required: true , expires: '1h' }
});


const userLoginHistory = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    loginTime: { type: Date, default: Date.now },
    ipAddress: { type: String, required: true }
});

const userEmailVerificationToken = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: '1h' }
});

module.exports = {
    User: mongoose.model('User', userSchema),
    UserLoginHistory: mongoose.model('UserLoginHistory', userLoginHistory),
    UserEmailVerificationToken: mongoose.model('UserEmailVerificationToken', userEmailVerificationToken)
};