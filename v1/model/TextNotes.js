const mongoose = require('mongoose')

const TextNotesSchema = new mongoose.Schema({
    header: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    desc: {
        type: String,
        required: true,
        trim: true,
        minlength: 10
    },
    tags: {
        type: Array,
        required: true,
        trim: true,
        minlength: 1
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    likes: {
        type: [String],
        default: []
    },
    comments: {
        type: [String]
    },
    userGleID: {
        type: String,
        required: true
    }
    // The userGleID is the user id when the user authenticates using Google
}, { timestamps: true })

const TextNotes = mongoose.model('TextNotes', TextNotesSchema)

module.exports = TextNotes