// Basic Library
const express = require('express');
const router = require('./src/routes/api');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

// Security Middleware Library
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

// Database Library
const mongoose = require('mongoose');

// Security middleware Implement
app.use(cors())
app.use(helmet())
app.use(mongoSanitize())
app.use(xssClean())
app.use(hpp(undefined))

// Body Parser Implement
app.use(bodyParser.json())

// Serve static frontend
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));
app.get('/', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
});

// Request Rate limit
const limiter = rateLimit({
    windowMs: 15*60*1000,   // 15 minute
    max: 1000,      // 1k request
})
app.use(limiter)

// Mongodb Database Connection
let URL = process.env.MONGODB_URI;
let OPTIONS = {user:'', pass:'', autoIndex:true};
/* mongoose.connect(URL, OPTIONS, (error) => {
    if (error) {
        console.log(error)
    }
    else {
        console.log("Database Connected Successfully")
    }
})  */
mongoose.connect(URL, OPTIONS)
    .then(() => console.log("Database Connected Successfully"))
    .catch((error) => console.log("Database Connection Failed:", error));

// Routing Implement
app.use('/api/v1', router)

// Undefined Route
const errorPages = ['404_1.html', '404_2.html', '404_3.html', "404_4.html"];
app.use('*', (req, res) => {
    // Pick a random file name
    const randomPage = errorPages[Math.floor(Math.random() * errorPages.length)];

    res.status(404).sendFile(path.join(__dirname, 'public/404', randomPage));
});

module.exports = app;
