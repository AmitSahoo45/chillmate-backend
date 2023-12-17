const mongoose = require('mongoose')
const ErrorSheet = require('../model/ErrorSheet')
const User = require('../model/User')
const { StatusCodes } = require('http-status-codes')
const SheetControll = require('../model/SheetControll')

const createErrorSheet = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = 9;
        const INDEX = (page - 1) * limit;
        
        const { id, probName, probLink, mistake,
            improvement, isMistakeCorrected, tags,
            revisionPriority, BeforeInterviewLookup } = req.body

        const newTags = tags
            .split(',')
            .map(item => item.trim())
            .filter((item, index, self) => self.indexOf(item) === index && item !== '');

        const newErrorSheet = await ErrorSheet.create({
            UserRef: id,
            probName,
            probLink,
            mistake,
            improvement,
            isMistakeCorrected,
            revisionPriority,
            BeforeInterviewLookup,
            tags: newTags
        })

        res.status(StatusCodes.CREATED).json({ errorsheet: newErrorSheet })
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message })
    }
}

const updateErrorSheet = async (req, res) => {
    try {
        const { id } = req.params
        const { userid, probName, probLink, mistake,
            improvement, isMistakeCorrected, tags,
            BeforeInterviewLookup, revisionPriority
        } = req.body

        const sheetExist = await ErrorSheet.findById(id).populate('UserRef', 'name photoURL')
        if (!sheetExist)
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Error Sheet not found' })

        if (sheetExist.UserRef._id != userid)
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'You are not authorized to perform this action' })

        const newTags = tags
            .split(',')
            .map(item => item.trim())
            .filter((item, index, self) => self.indexOf(item) === index && item !== '');

        sheetExist.probName = probName
        sheetExist.probLink = probLink
        sheetExist.mistake = mistake
        sheetExist.improvement = improvement
        sheetExist.isMistakeCorrected = isMistakeCorrected
        sheetExist.tags = newTags
        sheetExist.BeforeInterviewLookup = BeforeInterviewLookup
        sheetExist.revisionPriority = revisionPriority

        await sheetExist.save()

        res.status(StatusCodes.OK).json({ errorsheet: sheetExist })
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message })
    }
}

const deleteErrorSheet = async (req, res) => {
    try {
        const { id } = req.params
        const page = Number(req.query.page) || 1;
        const userid = req.query.userid
        const limit = 9;
        const INDEX = (page - 1) * limit;


        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid ID' })

        await ErrorSheet.findByIdAndDelete(id)

        const total = await ErrorSheet.countDocuments({ UserRef: userid })

        const errorsheets = await ErrorSheet.find({ UserRef: userid })
            .populate('probName probLink mistake improvement isMistakeCorrected tags')
            .populate('UserRef', 'name photoURL')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(INDEX)

        res.status(StatusCodes.OK).json({
            errorsheets,
            currentPage: page,
            numberOfPages: Math.ceil(total / limit)
        })
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message })
    }
}

const getErrorSheet = async (req, res) => {
    try {
        const { id } = req.params

        const sheetExist = await ErrorSheet.findById(id)

        if (!sheetExist)
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Error Sheet not found' })

        res.status(StatusCodes.OK).json({ errorsheet: sheetExist })
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message })
    }
}

const getErrorSheets = async (req, res) => {
    try {
        const { id } = req.params
        const page = Number(req.query.page) || 1;
        const limit = 9;
        const INDEX = (page - 1) * limit;
        
        let searchText = req.query.searchText
        let searchBy = req.query.searchBy

        let total, errorsheets;

        switch (searchBy) {
            case '':
                total = await ErrorSheet.countDocuments({ UserRef: id , 
                    $or: [
                        { probName: { $regex: searchText, $options: 'i' } },
                        { tags: { $regex: searchText, $options: 'i' } }
                    ]
                })
                errorsheets = await ErrorSheet.find({ UserRef: id , 
                    $or: [
                        { probName: { $regex: searchText, $options: 'i' } },
                        { tags: { $regex: searchText, $options: 'i' } }
                    ]
                })
                    .populate('probName probLink mistake improvement isMistakeCorrected tags')
                    .sort({ createdAt: -1 })
                    .limit(limit)
                    .skip(INDEX)
                break;

            case 'Yes':
                total = await ErrorSheet.countDocuments({ UserRef: id, BeforeInterviewLookup: 'Yes' })
                errorsheets = await ErrorSheet.find({ UserRef: id, BeforeInterviewLookup: 'Yes' })
                    .populate('probName probLink mistake improvement isMistakeCorrected tags')
                    .populate('UserRef', 'name photoURL')
                    .sort({ createdAt: -1 })
                    .limit(limit)
                    .skip(INDEX)
                break;

            case 'No':
                total = await ErrorSheet.countDocuments({ UserRef: id, BeforeInterviewLookup: 'No' })
                errorsheets = await ErrorSheet.find({ UserRef: id, BeforeInterviewLookup: 'No' })
                    .populate('probName probLink mistake improvement isMistakeCorrected tags')
                    .populate('UserRef', 'name photoURL')
                    .sort({ createdAt: -1 })
                    .limit(limit)
                    .skip(INDEX)
                break;

            case 'Maybe':
                total = await ErrorSheet.countDocuments({ UserRef: id, BeforeInterviewLookup: 'Maybe' })
                errorsheets = await ErrorSheet.find({ UserRef: id, BeforeInterviewLookup: 'Maybe' })
                    .populate('probName probLink mistake improvement isMistakeCorrected tags')
                    .populate('UserRef', 'name photoURL')
                    .sort({ createdAt: -1 })
                    .limit(limit)
                    .skip(INDEX)
                break;

            default:
                errorsheets = await ErrorSheet.find({ 
                    UserRef: id,
                    $or: [
                        { probName: { $regex: searchText, $options: 'i' } },
                        { tags: { $regex: searchText, $options: 'i' } }
                    ]
                })
                    .populate('probName probLink mistake improvement isMistakeCorrected tags')
                    .sort({ createdAt: -1 })
                    .limit(limit)
                    .skip(INDEX)
                total = errorsheets.length
                break;
        }

        const aboutUser = await User.findById(id).select('name photoURL')

        res.status(StatusCodes.OK).json({
            errorsheets,
            user: aboutUser,
            currentPage: page,
            numberOfPages: Math.ceil(total / limit)
        })
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message })
    }
}

const getErrorSheetsByTag = async (req, res) => {
    try {
        const { id } = req.params
        const { tag } = req.query
        const page = Number(req.query.page) || 1;
        const limit = 12;
        const INDEX = (page - 1) * limit;

        const total = await ErrorSheet.countDocuments({ userGleID: id, tags: { $in: [tag] } })

        const errorsheets = await ErrorSheet.find({ userGleID: id, tags: { $in: [tag] } })
            .populate('probName probLink mistake improvement isMistakeCorrected tags')
            .populate('UserRef', 'name photoURL')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(INDEX)

        res.status(StatusCodes.OK).json({
            errorsheets,
            currentPage: page,
            numberOfPages: Math.ceil(total / limit)
        })
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message })
    }
}

const getErrorSheetsByText = async (req, res) => { }

const getErrorSheetsByDate = async (req, res) => {
    try {
        const { id } = req.params
        const { date } = req.query
        const page = Number(req.query.page) || 1;
        const limit = 12;
        const INDEX = (page - 1) * limit;

        const total = await ErrorSheet.countDocuments({ userGleID: id, createdAt: { $gte: date } })

        const errorsheets = await ErrorSheet.find({ userGleID: id, createdAt: { $gte: date } })
            .populate('probName probLink mistake improvement isMistakeCorrected tags')
            .populate('UserRef', 'name photoURL')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(INDEX)

        res.status(StatusCodes.OK).json({
            errorsheets,
            currentPage: page,
            numberOfPages: Math.ceil(total / limit)
        })
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message })
    }
}

const giveAccessControll = async (req, res) => {
    try {
        const { SheetCreator } = req.params
        const { AccessUserId, AccessType } = req.body

        const sheetExist = await ErrorSheet.findById(ErrorSheetId)
        if (!sheetExist)
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Error Sheet not found' })

        const newSheetControll = await SheetControll.create({
            SheetCreator,
            AccessUserId,
            AccessType
        })

        res.status(StatusCodes.OK).json({ sheetControll: newSheetControll })
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message })
    }
}

const editAccessControll = async (req, res) => {
    try {
        const { id } = req.params
        const { AccessType } = req.body

        const sheetControllExist = await SheetControll.findById(id)
        if (!sheetControllExist)
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Sheet Controll not found' })

        sheetControllExist.AccessType = AccessType
        await sheetControllExist.save()

        res.status(StatusCodes.OK).json({ sheetControll: sheetControllExist })
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message })
    }
}

const removeAccessControll = async (req, res) => {
    try {
        const { id } = req.params

        await SheetControll.findByIdAndDelete(id)

        res.status(StatusCodes.OK).json({ message: 'Sheet Controll deleted successfully' })
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message })
    }
}

const getAllAccessControlls = async (req, res) => {
    try {
        const { SheetCreator } = req.params

        const AllAccessControlls = await SheetControll.find({ SheetCreator })

        res.status(StatusCodes.OK).json({ accessControlls: AllAccessControlls })
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message })
    }
}

module.exports = {
    getErrorSheets,
    createErrorSheet,
    updateErrorSheet,
    deleteErrorSheet,
    getErrorSheet,
    getErrorSheetsByTag,
    getErrorSheetsByText,
    getErrorSheetsByDate,
    giveAccessControll,
    editAccessControll,
    removeAccessControll,
    getAllAccessControlls
}
