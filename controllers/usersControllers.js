const User = require('../models/User')
const Note = require('../models/Note')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

//@desc Get all users
//@route GET /users
//@access Private
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password').lean()
    if(!users?.length) {
        return res.status(400).json({message: 'No se encontraron usuarios'})
    }
    res.json(users)
})

//@desc create new user
//@route POST /users
//@access Private
const createNewUser = asyncHandler(async (req, res) => {
    const { username, password, roles } = req.body
    //confirm data
    if(!username || !password || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({message: 'Todos los campos son necesarios'})
    }

    //Check for duplicates
    const duplicate = await User.findOne({ username }).lean().exec()

    if(duplicate) {
        return res.status(409).json({messge: 'Usuario duplicado'})
    }

    //Hash password
    const hashedPwd = await bcrypt.hash(password, 10)

    const userObject = { username, "password": hashedPwd, roles }

    //Create and store new user
    const user = await User.create(userObject)

    if(user) {
        res.status(201).json({message: `Nuevo usuario ${username} creado`})
    } else {
        res.status(400).json({message: 'informacion invalida de usuario recibida'})
    }
})

//@desc update user
//@route POST /users
//@access Private
const updateUser = asyncHandler(async (req, res) => {
    const { _id, username, roles, active, password } = req.body

    //confirm data
    if(!_id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(400).json({message: 'todos los campos son necesarios'})
    }

    const user = await User.findById(_id).exec()

    if(!user){
        return res.status(400).json({message: 'usuario no encontrado'})
    }

    //check for duplicate
    const duplicate = await User.findOne({ username }).lean().exec()
    //Allow updates to the original user
    if(duplicate && duplicate?._id.toString() !== _id) {
        return res.status(409).json({message: 'nombre de usuario duplicado'})
    }

    user.username = username
    user.roles = roles
    user.active = active

    if(password) {
        //hash password
        user.password = await bcrypt.hash(password, 10)
    }

    const updatedUser = await user.save()

    res.json({message: `${updatedUser.username} actualizado`})
})

//@desc delete user
//@route POST /users
//@access Private
const deleteUser = asyncHandler(async (req, res) => {
    const { _id } = req.body
    if(!_id){
        return res.status(400).json({message: 'se requiere de un user ID'})
    }

    const note = await Note.findOne({ user: _id }).lean().exec()
    if(note){
        return res.status(400).json({message: 'Usuario tiene asignado notas'})
    }

    const user = await User.findById(_id).exec()

    if(!user){
        return res.status(400).json({message: 'Usuario no encontrado'})
    }

    const username = user.username;
    const userId = user._id;

    const result = await user.deleteOne()

    const reply = `usuario ${username} con id ${userId} eliminado`

    res.json(reply)
})

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}
