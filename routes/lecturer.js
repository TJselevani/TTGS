const express = require('express')
const router = express.Router()
const {
    lecturerLogin,
    lecturerPage,
    dropUnit,
    selectUnitsPage,
    selectUnits} = require('../controllers/lecturer.controller')

// **************************************************************************************** Lecturer Login ********************************************************
router.get('/', lecturerPage);
router.delete('/dropUnit/:id', dropUnit);
// ***************************************************************************** Lecturer Select ******************************************************************
router.get('/select', selectUnitsPage)
router.post('/select', selectUnits)

module.exports = router