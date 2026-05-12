require('dotenv').config();
const express=require('express');
const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');
const app=express();
const path=require('path');
const cors=require('cors');

const mongoose=require('mongoose');
const session=require('express-session');
const flash=require('connect-flash');
const passport=require('./config/passport');
const { sessionTimeout } = require('./middleware/auth');

//Initialize the routes here
const authRoutes= require('./routes/auth/authRoutes');
const userRoutes=require('./routes/user/userRoute');
const settingRouter= require('./routes/settings/settingsRoute');

//Mongoose connection here
mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log("MongoDB connected");
}).catch(err => {
    console.error("MongoDB connection error:", err);
});

//Initialization of express here
app.use(express.urlencoded({extended:true}));
app.use(express.json());

//Use of CORS
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

//Session here
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));
app.use(sessionTimeout);

//Flash initialization here
app.use(flash());

//Passport initialization here
app.use(passport.initialize());
app.use(passport.session());

//Error handling middleware
app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500).send('Something broke!');
});


//Use the routes here
app.use('/',authRoutes);
app.use('/',userRoutes);
app.use('/',settingRouter);

app.listen(process.env.PORT,()=>{   
    console.log(`Server is running on port ${process.env.PORT}`);
});
