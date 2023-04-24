const mongoose = require('mongoose')
const Subject = require('../model/Subject')
const User = require('../model/User')
const { StatusCodes } = require('http-status-codes')
const TextNotes = require('../model/TextNotes')

const createSubject = async (req, res) => {
    try {
        const {
            Subname, Subdesc, Subtags, userGleID,
            name, email, photoURL
        } = req.body

        if (!Subname || !Subdesc || !Subtags || !userGleID)
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Please fill all the fields' })

        const ExistingUser = await User.findOne({ googleID: userGleID })
        let UserRef

        if (!ExistingUser) {
            const { _id } = await User.create({ name, email, photoURL, googleID: userGleID })
            UserRef = _id
        }
        else
            UserRef = ExistingUser._id

        const newTags = Subtags
            .split(',')
            .map(item => item.trim())
            .filter((item, index, self) => self.indexOf(item) === index && item !== '');
        await Subject.create({
            Subname, Subdesc,
            Subtags: newTags,
            userGleID,
            UserRef
        })

        res.status(StatusCodes.CREATED).json({ message: 'Subject created successfully' })
    } catch (error) {
        res.status(StatusCodes.NOT_FOUND).json({ message: error.message })
    }
}

const getSubjects = async (req, res) => {
    // This will fetch all the subvjects created by a specific user
    // id - Google ID of the user
    try {
        const { id } = req.params
        const page = Number(req.query.page) || 1;
        const limit = 6;
        const INDEX = (page - 1) * limit;
        // count total number of documents for the chapter 
        const total = await Subject.countDocuments({ userGleID: id })

        const subjects = await Subject.find({ userGleID: id })
            .populate('Subname Subdesc Subtags Likes')
            .populate('UserRef', 'name')
            .sort({ createdAt: 1 })
            .limit(limit)
            .skip(INDEX)

        res.status(StatusCodes.OK).json({
            subjects,
            currentPage: page,
            numberOfPages: Math.ceil(total / limit)
        })
    } catch (error) {
        res.status(StatusCodes.NOT_FOUND).json({ message: error.message })
    }
}

const getSubject = async (req, res) => {
    // here send the _id of the subject and get the Textnotes of that subject
    try {
        const { id } = req.params

        const notes = await TextNotes
            .find({ Subject: id })
            .select('header desc tags createdAt userGleID')
            .populate('UserRef', 'name')
            .sort({ createdAt: -1 })

        res.status(StatusCodes.OK).json({ notes, message: 'Notes fetched successfully' })
    } catch (error) {
        res.status(StatusCodes.NOT_FOUND).json({ message: error.message })
    }
}

const updateSubject = async (req, res) => {
    try {
        const { id } = req.params
        const { Subname, Subdesc, Subtags, userGleID } = req.body

        if (!Subname || !Subdesc || !Subtags)
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Missing fields' })

        const subjectExi = await Subject.findById(id)
        if (!subjectExi)
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Subject not found' })

        if (subjectExi.userGleID != userGleID)
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized User' })

        const newTags = Subtags.split(',').map(item => item.trim()).filter(item => item != '')

        subjectExi.Subname = Subname
        subjectExi.Subdesc = Subdesc
        subjectExi.Subtags = newTags

        await subjectExi.save()

        res.status(StatusCodes.OK).json({ message: 'Subject updated successfully' })
    } catch (error) {
        console.log(error)
        res.status(StatusCodes.NOT_FOUND).json({ message: error.message })
    }
}

const deleteSubject = async (req, res) => {
    try {
        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Subject not found' })

        await Subject.findByIdAndDelete(id)

        res.status(StatusCodes.OK).json({ message: 'Subject deleted successfully' })
    } catch (error) {
        res.status(StatusCodes.NOT_FOUND).json({ message: error.message })
    }
}

const LikeANote = async (req, res) => {
    try {
        const { id } = req.params
        const { name, email, photoURL, userGleID } = req.body

        if (!userGleID)
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Missing fields' })

        const subjectExi = await Subject.findById(id)
        if (!subjectExi)
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Subject not found' })

        const existingUser = await User.find({ googleID: userGleID })
        if (!existingUser)
            await User.create({ name, email, photoURL, googleID: userGleID })

        const index = subjectExi.Likes.findIndex((id) => id == String(userGleID))

        if (index === -1)
            subjectExi.Likes.push(userGleID)
        else
            subjectExi.Likes = subjectExi.Likes.filter((id) => id != String(userGleID))

        await subjectExi.save()

        res.status(StatusCodes.OK).json({ message: 'Subject updated successfully' })
    } catch (error) {
        res.status(StatusCodes.NOT_FOUND).json({ message: error.message })
    }
}

const SharingSubject = async (req, res) => {
    try {
        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Subject not found' })

        const page = Number(req.query.page) || 1;
        const limit = 10;
        const INDEX = (page - 1) * limit;
        // count total number of documents for the chapter 
        const total = await TextNotes.countDocuments({ Subject: id })

        const notes = await TextNotes
            .find({ Subject: id })
            .select('header desc tags createdAt userGleID createdAt')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(INDEX)

        const subject = await Subject
            .findById(id)
            .select('Subname Subdesc Subtags Likes createdAt')
            .populate('UserRef', 'name photoURL')

        res.status(StatusCodes.OK).json({ subject, notes, message: 'Notes fetched successfully' })
    } catch (error) {
        res.status(StatusCodes.NOT_FOUND).json({ message: error.message })
    }
}

const getNoteContent = async (req, res) => {
    try {
        const { id } = req.params

        const content = await TextNotes.findById(id)
            .select('content')

        res.status(StatusCodes.OK).json({ content, message: 'Content fetched successfully' })
    } catch (error) {
        res.status(StatusCodes.NOT_FOUND).json({ message: error.message })
    }
}

module.exports = {
    createSubject,
    getSubjects,
    getSubject,
    updateSubject,
    deleteSubject,
    LikeANote,
    SharingSubject,
    getNoteContent
}