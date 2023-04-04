const mongoose = require('mongoose')
const TextNotes = require('../model/TextNotes')
const { StatusCodes } = require('http-status-codes')

const CreateNotes = async (req, res) => {
    try {
        const { header, desc, tags, content, userGleID } = req.body

        if (!header || !desc || !tags || !content || !userGleID)
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Please fill all the fields' })

        const newTags = tags.split(',').map(item => item.trim()).filter(item => item !== '')

        const newNote = await TextNotes.create({ header, desc, tags: newTags, content, userGleID })

        res.status(StatusCodes.CREATED).json({ note: newNote, message: 'Note created successfully' })
    } catch (error) {
        res.status(StatusCodes.NOT_FOUND).json({ message: error.message })
    }
}

const upDateNote = async (req, res) => {
    try {
        const { id } = req.params
        const { header, desc, tags, content, _id, userGleID } = req.body

        /*
         _id and userGleID are the user id when the user authenticates using Google.
         _id is the one when user is created in the database and userGleID is the one when user is authenticated using Google
        */
        if (!header || !desc || !tags || !content)
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Missing fields' })

        if (!_id || !userGleID)
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Missing credentials' })

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
        const { _id, userGleID } = req.body

        if (!_id || !userGleID)
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Missing credentials' })

        await TextNotes.findByIdAndDelete(id)

        res.status(StatusCodes.OK).json({ message: 'Note deleted successfully' })
    } catch (error) {
        res.status(StatusCodes.NOT_FOUND).json({ message: error.message })
    }
}

const GetNotes = async (req, res) => {
    try {
        const { id } = req.params

        if (!id)
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'User ID is missing' })

        const notes = await TextNotes.find({ userGleID: id })
            .sort({ createdAt: -1 })

        res.status(StatusCodes.OK).json({ notes, message: 'Notes fetched successfully' })
    } catch (error) {
        res.status(StatusCodes.NOT_FOUND).json({ message: error.message })
    }
}

const getNote = async (req, res) => {
    try {
        const { id } = req.params

        const note = await TextNotes.findById(id)

        res.status(StatusCodes.OK).json({ note, message: 'Note fetched successfully' })
    } catch (error) {
        res.status(StatusCodes.NOT_FOUND).json({ message: error.message })
    }
}

module.exports = {
    CreateNotes,
    GetNotes,
    getNote,
    upDateNote,
    deleteNote
}
