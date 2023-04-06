const User = require('../model/User')
const { StatusCodes } = require('http-status-codes')

const RegisterUser = async (req, res) => {
    try {
        const { name, email, photoURL, googleID } = req.body

        console.log(req.body)

        if (!name || !email || !photoURL || !googleID)
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Please fill all the fields' })

        const ExistingUser = await User.findOne({ googleID })

        if (ExistingUser)
            return res.status(StatusCodes.CREATED).json({ _id: ExistingUser._id, message: 'User has Signed in' })

        const newUser = await User.create({ name, email, photoURL, googleID })

        res.status(StatusCodes.CREATED).json({ _id: newUser._id, message: 'Auth successfull' })
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Please signout and signin again' })
    }
}

module.exports = {
    RegisterUser
}