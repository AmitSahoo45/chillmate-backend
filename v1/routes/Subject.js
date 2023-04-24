const express = require('express');
const router = express.Router();

const {
    createSubject,
    updateSubject,
    getSubjects,
    getSubject,
    deleteSubject,
    LikeANote,
    SharingSubject,
    getNoteContent
} = require('../controllers/Subject');

router.post('/create', createSubject);
router.get('/all/:id', getSubjects);
router.get('/:id', getSubject)
    .patch('/:id', updateSubject)
    .delete('/:id', deleteSubject);
router.patch('/like/:id', LikeANote);
router.get('/share/:id', SharingSubject);
router.get('/content/:id', getNoteContent);

module.exports = router;