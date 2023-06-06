const express = require('express')
const router = express.Router()
const { home, homePage } = require('../controllers/home.controller')

// **************************************************************************************** Index ********************************************************
router.get('/', home)
router.get('/index', homePage)

module.exports = router