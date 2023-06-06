const passport = require('passport')
const jwt = require('jsonwebtoken')


const adminLogin = (req, res, next) => {
    passport.authenticate('local-strategy', {
        successRedirect: '/admin',
        failureRedirect: '/',
        failureFlash: false
      })(req, res, next)
}

const lecturerLogin = (req, res, next) => {
    passport.authenticate('custom-strategy', {
        successRedirect: '/lecturer',
        failureRedirect: '/',
        failureFlash: false
      })(req, res, next)
}

module.exports = {
    adminLogin,
    lecturerLogin
}