const AdminMDL = require('../models/admin');
const LecturerMDL = require('../models/lecturer');

const getAdmin = async (username, password) => {
    try{ return await AdminMDL.findOne({name: username, password}) }
    catch(err){console.log(err)}
}

const getLecturer = async (username) => {
    try{ return await LecturerMDL.findOne({lecID: username}) }
    catch(err){console.log(err)}
}

const getAdminById = async(_id) => {
    try{ return await AdminMDL.findById({_id}) }
    catch(err){console.log(err)}
}

const getLecturerById = async(_id) => {
    try{ return await LecturerMDL.findById({_id}) }
    catch(err){console.log(err)}
}

const checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) { return next() }
    res.redirect("/")
}
  
const checkAdminLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {  return res.redirect("/admin") }
    next()
}

const checkLecturerLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) { return res.redirect("/Lecturer") }
    next()
}

module.exports = {
    getAdmin,
    getLecturer,
    getAdminById,
    getLecturerById,
    checkAuthenticated, 
    checkAdminLoggedIn, 
    checkLecturerLoggedIn}