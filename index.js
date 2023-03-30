const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(bodyParser.json({
    limit: '30mb',
    extended: true
}));

app.use(bodyParser.urlencoded({
    limit: '30mb',
    extended: true
}));

const corsOptions = {
    origin: ['http://localhost:3000', 'https://chillmate.vercel.app'],
    credentials: true,
    optionSuccessStatus: 200
}

app.use(cors(corsOptions));