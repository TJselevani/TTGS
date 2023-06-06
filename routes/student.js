const express = require('express')
const router = express.Router()
const {
    getTimetables,
    selectTimetable
} = require('../controllers/student.controller')

// **************************************************************************************** Student Login ********************************************************
router.get('/', getTimetables)
router.post('/student-timetable', selectTimetable)

module.exports = router