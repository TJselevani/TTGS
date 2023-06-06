const express = require('express');
const router = express.Router();

const { adminLogin, lecturerLogin } =require('../controllers/auth.controller');

router.post('/admin', adminLogin)
router.post('/lecturer', lecturerLogin)

module.exports = router