const mongoose = require('mongoose')

const ErrorSheetSchema = new mongoose.Schema({
    UserRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    probName: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    probLink: {
        type: String,
        required: true,
        trim: true,
        minlength: 10
    },
    mistake: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    improvement: {
        type: String,
        required: true,
        trim: true
    },
    isMistakeCorrected: {
        type: Boolean,
        default: false
    },
    revisionPriority: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        default: 'Low'
    },
    BeforeInterviewLookup: {
        type: String,
        enum: ['Yes', 'No', 'Maybe'],
        default: 'No'
    },
    tags: [{
        type: String,
        trim: true
    }]
}, { timestamps: true })

const ErrorSheet = mongoose.model('ErrorSheet', ErrorSheetSchema)

module.exports = ErrorSheet