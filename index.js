require('dotenv').config();
const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const {
    body,
    query,
    validationResult
} = require('express-validator');
const morgan = require('morgan');

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN
}));
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'https://i.ytimg.com'],
            fontSrc: ["'self'", 'https:'],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
}));
app.use(express.static('public'));
app.use(morgan('combined')); // Log requests

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter);

app.get('/videoInfo',
    query('url').isURL(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new Error('Invalid URL'));
        }

        const videoURL = req.query.url;
        try {
            const info = await ytdl.getInfo(videoURL);
            res.json({
                videoDetails: info.videoDetails,
                formats: info.formats
            });
        } catch (error) {
            next(error);
        }
    });

app.get('/download',
    query('url').isURL(),
    query('itag').isNumeric(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new Error('Invalid input'));
        }

        const url = decodeURIComponent(req.query.url);
        const itag = req.query.itag;
        const name = decodeURIComponent(req.query.name);

        if (!ytdl.validateURL(url)) {
            return next(new Error('Invalid YouTube URL'));
        }

        res.header('Content-Disposition', `attachment; filename="${name}.mp4"`);
        ytdl(url, {
            quality: itag
        }).pipe(res);
    });

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('An error occurred');
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Server running. Port ${port}!`);
});