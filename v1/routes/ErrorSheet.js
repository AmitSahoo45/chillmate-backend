const express = require('express');
const router = express.Router();

const {
    createErrorSheet,
    getErrorSheets,
    updateErrorSheet,
    deleteErrorSheet,
    getErrorSheet
} = require('../controllers/ErrorSheet');


router.post('/create', createErrorSheet);
router.get('/all/:id', getErrorSheets);
router.patch('/:id', updateErrorSheet)
    .delete('/:id', deleteErrorSheet)
    .get('/:id', getErrorSheet);

module.exports = router;