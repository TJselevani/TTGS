const UnitMDL = require("../models/unit");
const ClassroomMDL = require("../models/classroom");
const TimetableMDL = require("../models/timetable");
const LecturerMDL = require("../models/lecturer");
const axios = require("axios");
const { getUserById } = require("./passport");

const adminPage = async (req, res) => {
  const lecInfo = await LecturerMDL.find();
  const tTable = await TimetableMDL.findOne({ semester: 1 });
  const user = await getUserById(req.session.passport.user);
  const sem = req.body.semester || "1";
  res.render("admin", {
    title: "Admin",
    name: user.name,
    semester: sem,
    message: "",
    lecturerInfo: lecInfo,
    timetableData: tTable ? tTable.unitss : [],
  });
};

const getSemesters = async (req, res) => {
  const user = await getUserById(req.session.passport.user);
  const sem = req.body.semester || "1";
  console.log(sem);
  const lecInfo = await LecturerMDL.find();
  const tTable = await TimetableMDL.findOne({ semester: sem });
  res.render("admin", {
    title: "Admin",
    name: user.name,
    semester: sem,
    message: "",
    lecturerInfo: lecInfo,
    timetableData: tTable ? tTable.unitss : [],
  });
};

const getLecturers = async (req, res) => {
  const lecIn = await LecturerMDL.find();
  res.render("manageLecturers", {
    lecturerInfo: lecIn,
    title: "admin-lecturers",
  });
};

const addLecturer = (req, res) => {
  const lecturer = new LecturerMDL(req.body);

  lecturer
    .save()
    .then((result) => {
      res.redirect("/admin/manageLecturers");
    })
    .catch((err) => {
      console.log(err);
    });
};

const deleteLecturer = (req, res) => {
  const id = req.params.id;

  LecturerMDL.findByIdAndDelete(id)
    .then((result) => {
      res.json({ redirect: "/admin/manageLecturers" });
    })
    .catch((err) => {
      console.log(err);
    });
};

const getUnits = async (req, res) => {
  const result = await UnitMDL.find();
  res.render("manageUnits", { unitInfo: result, title: "admin-units" });
};

const addUnit = (req, res) => {
  const unit = new UnitMDL(req.body);

  unit
    .save()
    .then((result) => {
      res.redirect("/admin/manageUnits");
    })
    .catch((err) => {
      console.log(err);
    });
};

const deleteUnit = (req, res) => {
  const id = req.params.id;

  UnitMDL.findByIdAndDelete(id)
    .then((result) => {
      res.json({ redirect: "/admin/manageUnits" });
    })
    .catch((err) => {
      console.log(err);
    });
};

const getClassrooms = async (req, res) => {
  const result = await ClassroomMDL.find();
  res.render("manageClassrooms", {
    classroomInfo: result,
    title: "admin-classrooms",
  });
};

const addClassroom = (req, res) => {
  const classroom = new ClassroomMDL(req.body);

  classroom
    .save()
    .then((result) => {
      res.redirect("/admin/manageClassrooms");
    })
    .catch((err) => {
      console.log(err);
    });
};

const deleteClassroom = (req, res) => {
  const id = req.params.id;

  ClassroomMDL.findByIdAndDelete(id)
    .then((result) => {
      res.json({ redirect: "/admin/manageClassrooms" });
    })
    .catch((err) => {
      console.log(err);
    });
};

const getTimetables = async (req, res) => {
  const result = await TimetableMDL.find();
  res.render("allocation", { title: "admin-allot", timetableData: result });
};

const allocateUnits = async (req, res) => {
  const units = await UnitMDL.find();
  res.render("allocateUnits", { title: "admin-allot-Units", unitInfo: units });
};

const allocateClassrooms = async (req, res) => {
  const unitIn = await UnitMDL.find();
  const classInfo = await ClassroomMDL.find();
  res.render("allocateClassrooms", {
    title: "admin-allot-Classes",
    unitInfo: unitIn,
    classroomInfo: classInfo,
  });
};

const timetablePage = (req, res) => {
  res.render("generateTimetable", { title: "admin-generate" });
};

const testConnection = (req, res) => {
  const options = {
    url: "http://127.0.0.1:5000/",
    port: 5000,
    method: "GET",
    headers: { "Content-Type": "Application/json" },
  };

  // Send the HTTP request
  axios(options)
    .then((response) => {
      // Process the response data
      const prediction = response.data;
      res.send(prediction);
    })
    .catch((error) => {
      console.error(error);
    });
};

const generateTimetable = (req, res) => {
  // Define the request data

  // Set the request options
  const options = {
    url: "http://localhost:5000/timetable",
    port: 5000,
    method: "POST",
    headers: { "Content-Type": "Application/json" },
  };

  // Send the HTTP request
  axios(options)
    .then((response) => {
      // Process the response data
      const prediction = response.data; //
      res.send(prediction);
      console.log(prediction);
      console.log(prediction[0]);
      // console.log(prediction.JSON.semester)

      //  Define the timetable data
      prediction.map(async (item) => {
        // Create a new instance of the Timetable model and pass the data object
        const timetable = TimetableMDL(item);
        // Save the new timetable instance to the database
        const fin = await timetable.save();
      });
    })
    .catch((error) => {
      console.error(error);
    });
};

module.exports = {
  adminPage,
  getSemesters,
  getLecturers,
  addLecturer,
  deleteLecturer,
  getUnits,
  addUnit,
  deleteUnit,
  getClassrooms,
  addClassroom,
  deleteClassroom,
  getTimetables,
  allocateUnits,
  allocateClassrooms,
  timetablePage,
  testConnection,
  generateTimetable,
};
