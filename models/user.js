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
     lastLogin: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);