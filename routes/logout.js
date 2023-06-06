const express = require('express')
const router = express.Router()
const logOut = require('../controllers/logout.controller')

router.delete('/user', logOut)

module.exports = router