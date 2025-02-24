const LecturerMDL = require("../models/lecturer");
const TimetableMDL = require("../models/timetable");
const UnitMDL = require("../models/unit");
const { getUserById } = require("./passport");

const lecturerPage = async (req, res) => {
  lecid = req.session.passport.user;
  const user = await getUserById(req.session.passport.user);
  lec = user.name;

  const lecUnits = await LecturerMDL.findById(lecid);
  const tTable = await TimetableMDL.find({});
  const filteredUnits = tTable.map((doc) => ({
    ...doc.toObject(),
    unitss: doc.unitss.filter((unit) => unit.unitLecturer === lec),
  }));

  res.render("lecturer", {
    docs: lecUnits.unit,
    title: "Lecturer",
    name: lec,
    message: "",
    timetableData: filteredUnits,
  }); ///tTable ? tTable.unitss : []
};

const dropUnit = async (req, res) => {
  const user = await getUserById(req.session.passport.user);
  const lec = user.name;
  const id = req.params.id;

  try {
    // Find the lecturer document
    const lecturerDoc = await LecturerMDL.findById(user._id);
    const unitToDrop = lecturerDoc.unit.find(
      (unit) => unit._id.toString() === id
    );

    if (!unitToDrop) {
      return res.status(404).send("Unit not found in lecturer's units");
    }

    // Remove the unit from the lecturer's units
    lecturerDoc.unit = lecturerDoc.unit.filter(
      (unit) => unit._id.toString() !== id
    );
    await lecturerDoc.save();

    // Now update the corresponding Unit document
    await UnitMDL.findOneAndUpdate(
      { code: unitToDrop.unitCode },
      { $set: { lecturer: "", isAssigned: false } } // Clear lecturer and set isAssigned to false
    );

    res.redirect("/lecturer");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while dropping the unit");
  }
};

// const dropUnit = async (req, res) => {
//   const user = await getUserById(req.session.passport.user);
//   const lec = user.name;
//   const id = req.params.id;

//   try {
//     const document = await LecturerMDL.findOne({ units: id });
//     const names = document.unit;

//     const index = names.indexOf({ unitCode });
//     if (index !== -1) {
//       names.splice(index, 1);
//     }

//     document.unit = names;
//     await document.save();

//     res.redirect("/lecturer");
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("An error occurred while dropping the unit");
//   }
// };

const selectUnitsPage = async (req, res) => {
  const user = await getUserById(req.session.passport.user);
  const lec = user.name;

  const tTable = await TimetableMDL.find();
  const result = await UnitMDL.find();
  const filteredUnits = tTable.map((doc) => ({
    ...doc.toObject(),
    unitss: doc.unitss.filter((unit) => unit.unitLecturer === lec),
  }));
  res.render("select", {
    unitInfo: result,
    title: "Lecturer-select",
    name: lec,
    timetableData: filteredUnits,
  }); //tTable ? tTable.unitss : []
};

const selectUnits = async (req, res) => {
  const user = await getUserById(req.session.passport.user);
  const lec = user.name;
  const lecId = req.session.passport.user;

  // Get the list of selected units from the request body
  const selectedItems = req.body.selected;
  console.log(selectedItems);

  try {
    const lecDoc = await LecturerMDL.findById(lecId);

    const promises = selectedItems.map((item) => {
      const units = item.trim().split("|");
      const unitCode = units[0];
      const unitName = units[1];
      return { unitCode, unitName };
    });
    console.log(promises);
    lecDoc.unit = [...lecDoc.unit, ...promises];
    lecDoc.save();

    // Update each unit's lecturer field to the current lecturer's name
    for (const unit of promises) {
      await UnitMDL.findOneAndUpdate(
        { code: unit.unitCode },
        { $set: { lecturer: lecDoc.name, isAssigned: true } }
      );
    }

    await Promise.all(promises);

    console.log(`${selectedItems.length} Units Successfully Selected`);
    const tTable = await TimetableMDL.find();
    const filteredUnits = tTable.map((doc) => ({
      ...doc.toObject(),
      unitss: doc.unitss.filter((unit) => unit.unitLecturer === lec),
    }));
    res.redirect("/lecturer", 301, {
      title: "Lecturer",
      name: lec,
      timetableData: filteredUnits,
    }); // tTable ? tTable.unitss : []
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
};

module.exports = {
  lecturerPage,
  dropUnit,
  selectUnitsPage,
  selectUnits,
};
