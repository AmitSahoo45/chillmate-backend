const express = require('express');
const router = express.Router();

const {
    createSubject,
    updateSubject,
    getSubjects,
    getSubject,
    deleteSubject,
    LikeANote
} = require('../controllers/Subject');

router.post('/create', createSubject);
router.get('/all/:id', getSubjects);
router.get('/:id', getSubject)
    .patch('/:id', updateSubject)
    .delete('/:id', deleteSubject);
router.patch('/like/:id', LikeANote);

module.exports = router;