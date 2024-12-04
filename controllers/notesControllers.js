const Note = require('../models/Note')
const User = require('../models/User')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

//@desc Get all notes
//@route GET /notes
//@access Private
const getAllNotes = asyncHandler(async (req, res) => {
    const notes = await Note.find().lean()
    if(!notes?.length){
        return res.status(400).json({message: 'No se encontraron notas'})
    }

    //Adding username to each note

    //SOLUCION CON FOR...OF
    // const notesWithUser = async (notes) => {
    //     const notesWithUsernames = [];

    //     for(const note of notes) {
    //         const user = await User.findById(note.user).lean().exec()
    //         notesWithUsernames.push({...note, username: user.username})
    //     }
    //     return notesWithUsernames
    // }

    //SOLUCION CON PROMISE.ALL Y MAP()
    const notesWithUser = await Promise.all(notes.map(async (note) =>{
        const user = await User.findById(note.user).lean().exec()
        return {...note, username: user.username}
    }))

    res.json(notesWithUser)

})

//@desc create note
//@route PUT /notes
//@access Private
const createNote = asyncHandler(async (req, res) => {
    const { user, title, text } = req.body
    //confirm data
    if(!user || !title || !text){
        return res.status(400).json({message: 'Todos los campos son necesarios'})
    }
    //check for duplicate
    const duplicate = await Note.findOne({title}).lean().exec()

    if(duplicate){
        return res.status(409).json({message: 'titulo duplicado'})
    }

    //Create and store the new note
    const note = await Note.create({user, title, text})

    if(note){
        return res.status(201).json({message: 'Nueva nota creada'})
    } else {
        return res.status(400).json({message: 'Datos de nota invalidos recibidos'})
    }
})

//@desc update note
//@route PATCH /notes
//@access Private
const updateNote = asyncHandler(async (req, res) => {
    const { _id, user, title, text } = req.body

    //confirm data
    if(!_id || !user || !title || !text || typeof completed !== 'boolean') {
        return res.status(400).json({messge: 'Todos los campos son necesarios'})
    }

    //confirm existance
    const note = await Note.findById(_id).exec()

    if(!note){
        return res.status(400).json({message: 'Nota no encontrada'})
    }

    //Check for duplicate
    const duplicate = await Note.findOne({title}).lean().exec()

    //Allow the remaining of the original note
    if(duplicate && duplicate?._id.toString() !== _id) {
        return res.status(409).json({message: 'Titulo de nota duplicado'})
    }

    note.user = user
    note.title = title
    note.text = text
    note.completed = completed
    
    const updatedNote = await note.save()

    res.json(`${updatedNote.title} actualizada`)
})

//@desc delete note
//@route DELETE /notes
//@access Private
const deleteNote = asyncHandler(async (req, res) => {
    const { _id } = req.hody
    if(!_id) {
        res.status(400).json({message: 'Se requiere saber el id de la nota'})
    }

    const note = await Note.findById({_id}).exec()

    if(!note) {
        res.status(400).json({message: 'Nota no encontrada'})
    }

    tituloNota = note.title
    idNota = note._id

    const result = await note.deleteOne()

    const reply = `Nota ${tituloNota} con ID ${idNota} ha sido eliminada`

    res.json(reply)
})

module.exports = {
    getAllNotes,
    createNote,
    updateNote,
    deleteNote
}