const mongoose = require('mongoose')
const TextNotes = require('../model/TextNotes')
const SubjectModel = require('../model/Subject')
const User = require('../model/User')
const { StatusCodes } = require('http-status-codes')

const CreateNotes = async (req, res) => {
    try {
        const {
            header, desc, tags, content, userGleID,
            name, email, photoURL,
            Subject
        } = req.body

        if (!header || !desc || !tags || !content)
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Please fill all the fields' })

        if (!Subject)
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Subject is empty' })

        if (!userGleID)
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Please login to create notes' })

        const ExistingUser = await User.findOne({ googleID: userGleID })
        let UserRef = null

        if (!ExistingUser) {
            const { _id } = await User.create({ name, email, photoURL, googleID: userGleID })
            UserRef = _id
        }
        else
            UserRef = ExistingUser._id

        const newTags = [...new Set(tags.split(',').map(item => item.trim()).filter(item => item !== ''))];

        const newNote = await TextNotes.create({
            header,
            desc,
            tags: newTags,
            content,
            userGleID,
            UserRef,
            Subject
        })

        // the subject is the subject's id. 
        // Take the subject and push it to the specific subject's notes array 
        await SubjectModel.findOneAndUpdate(
            { _id: Subject },
            { $push: { Chapters: newNote._id } },
            { new: true }
        )

        res.status(StatusCodes.CREATED).json({ note: newNote, message: 'Note created successfully' })
    } catch (error) {
        res.status(StatusCodes.NOT_FOUND).json({ message: error.message })
    }
}

const upDateNote = async (req, res) => {
    try {
        const { id } = req.params
        const { header, desc, tags, content, userGleID } = req.body

        if (!header || !desc || !tags || !content)
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Missing fields' })

        let note = await TextNotes.findById(id)

        if (!note)
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Note not found' })

        if (note.userGleID !== userGleID)
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized User' })

        const newTags = tags.split(',').map(item => item.trim()).filter(item => item !== '')

        note.header = header
        note.desc = desc
        note.tags = newTags
        note.content = content

        note = await note.save()

        res.status(StatusCodes.OK).json({ note, message: 'Note updated successfully' })
    } catch (error) {
        res.status(StatusCodes.NOT_FOUND).json({ message: error.message })
    }
}

const deleteNote = async (req, res) => {
    try {
        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Note not found' })

        await TextNotes.findByIdAndDelete(id)

        res.status(StatusCodes.OK).json({ message: 'Note deleted successfully' })
    } catch (error) {
        res.status(StatusCodes.NOT_FOUND).json({ message: error.message })
    }
}

const GetNotes = async (req, res) => {
    // This fetches all notes created by a user. in the req.params we send the google id of the user 
    try {
        const { id } = req.params

        if (!id)
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'User ID is missing' })

        const notes = await TextNotes.find({ userGleID: id })
            .sort({ header: -1 })
            .populate('UserRef', 'name email photoURL')

        res.status(StatusCodes.OK).json({ notes, message: 'Notes fetched successfully' })
    } catch (error) {
        res.status(StatusCodes.NOT_FOUND).json({ message: error.message })
    }
}

const getNote = async (req, res) => {
    try {
        const { id } = req.params

        const note = await TextNotes.findById(id)
            .populate('UserRef', 'name email photoURL')

        if (!note)
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'No note found' })

        res.status(StatusCodes.OK).json({ note, message: 'Note fetched successfully' })
    } catch (error) {
        res.status(StatusCodes.NOT_FOUND).json({ message: error.message })
    }
}

const getNotesMetaData = async (req, res) => {
    try {
        const { id } = req.params

        if (!id)
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'User ID is missing' })

        const notes = await TextNotes.find({ userGleID: id })
            .sort({ createdAt: -1 })
            .select('-__v -content -userGleID -likes -comments')
            .populate('UserRef', 'name email photoURL')

        res.status(StatusCodes.OK).json({ notes, message: 'Notes fetched successfully' })
    } catch (error) {
        res.status(StatusCodes.NOT_FOUND).json({ message: error.message })
    }
}

const LikeANote = async (req, res) => {
    try {
        const { id } = req.params
        const { name, email, photoURL, userGleID } = req.body

        if (!id)
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Note ID is missing' })

        if (!userGleID)
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'User ID is missing' })

        const existingUser = await User.find({ googleID: userGleID })

        if (!existingUser)
            await User.create({ name, email, photoURL, googleID: userGleID })

        await TextNotes.findByIdAndUpdate(id, { $addToSet: { likes: userGleID } })

        res.status(StatusCodes.OK).json({ message: 'Liked successfully' })
    } catch (error) {
        res.status(StatusCodes.NOT_FOUND).json({ message: error.message })
    }
}

module.exports = {
    CreateNotes,
    GetNotes,
    getNote,
    upDateNote,
    deleteNote,
    getNotesMetaData
}
