const express = require('express')
const router = express.Router()
const notesControllers = require('../controllers/notesControllers')

router.route('/')
    .get(notesControllers.getAllNotes)
    .put(notesControllers.createNote)
    .patch(notesControllers.updateNote)
    .delete(notesControllers.deleteNote)

module.exports = router