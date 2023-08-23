const mongoose = require('mongoose')

const SheetControllSchema = new mongoose.Schema({
    SheetCreator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    AccessUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    AccessType: {
        type: String,
        enum: ['read', 'edit', 'cru', 'crud'],
        default: 'read',
        required: true
    }
}, { timestamps: true })

const SheetControll = mongoose.model('SheetControll', SheetControllSchema)

module.exports = SheetControll