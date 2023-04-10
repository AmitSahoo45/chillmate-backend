const mongoose = require('mongoose')

const SubjectSchema = new mongoose.Schema({
    Subname: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    Subdesc: {
        type: String,
        required: true,
        trim: true,
        minlength: 10
    },
    Subtags: {
        type: Array,
        required: true,
        trim: true,
        minlength: 1
    },
    userGleID: {
        type: String,
        required: true
    },
    Chapters: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'TextNotes'
    },
    Likes: {
        type: [String]
    },
    UserRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true })

SubjectSchema.pre('remove', async function (next) {
    try {
        const chapterIds = this.Chapters.map(chapter => chapter._id)
        await TextNotes.deleteMany({ Chapter: { $in: chapterIds } })
        next()
    } catch (error) {
        next(error)
    }
})

module.exports = mongoose.model('Subject', SubjectSchema)