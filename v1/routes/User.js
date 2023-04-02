const express = require('express');
const router = express.Router();

const { RegisterUser } = require('../controllers/User')

router.post('/auth', RegisterUser);

module.exports = router;