const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const { TextNoteRouter, UserRouter } = require('./v1/routes')

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
};

app.use(cors(corsOptions));



const CONNECTION_URL = process.env.MONGO_URI
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Hello from Chillmate API');
});

app.use('/v1/user', UserRouter)
app.use('/v1/textnotes', TextNoteRouter)

// Version 1

mongoose.connect(CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.log(error.message);
    })