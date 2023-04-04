const express = require('express');
const router = express.Router();
const {
    CreateNotes,
    GetNotes,
    getNote,
    upDateNote,
    deleteNote
} = require('../controllers/TextNotes');


router.post('/create', CreateNotes);
router.get('/all/:id', GetNotes);
router.get('/:id', getNote)
    .patch('/:id', upDateNote)
    .delete('/:id', deleteNote);

module.exports = router;