const TimetableMDL = require("../models/timetable");

const getTimetables = async (req, res) => {
  const tTable = await TimetableMDL.findOne({ semester: 1 });
  const sem = req.body.semester || "1";
  res.render("student", {
    title: "student",
    semester: sem,
    timetableData: tTable ? tTable.unitss : [],
  }); //
};

const selectTimetable = async (req, res) => {
  const sem = req.body.semester || "1";
  const tTable = await TimetableMDL.findOne({ semester: sem });
  res.render("student", {
    title: "student",
    semester: sem,
    timetableData: tTable ? tTable.unitss : [],
  }); //
};

module.exports = {
  getTimetables,
  selectTimetable,
};
