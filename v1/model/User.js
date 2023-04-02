const mongoose = require('mongoose')
const validate = require('validator/lib/isEmail')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if (!validate(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    photoURL: {
        type: String,
        required: true
    },
    googleID: {
        type: String,
        required: true,
        unique: true
    },
}, { timestamps: true })

module.exports = mongoose.model('User', UserSchema)