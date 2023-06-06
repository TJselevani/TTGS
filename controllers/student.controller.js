const TimetableMDL = require("../models/timetable");


const getTimetables = async (req, res) => {
    const tTable = await TimetableMDL.findOne({ semester: 1 })
    res.render('student', {title: 'student', timetableData: tTable ? tTable.unitss : []});//
}

const selectTimetable = async (req, res) => {
    const sem = req.body.semester;
    const tTable = await TimetableMDL.findOne({ semester: sem })
    res.render('student', {title: 'student', timetableData: tTable ? tTable.unitss : []});//
}

module.exports = {
    getTimetables,
    selectTimetable
}