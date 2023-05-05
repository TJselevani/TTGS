const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const timetableSchema = new Schema({
  semester:{
      type: String,
      required: true
  },
  unitss: [{
    unitCode: {type: String, required: true},
    unitName: {type: String, required: true},
    unitLecturer: {type: String},
    classroom: {type: String, required: true},
    day: {type: String, required: true},
    period: {type: Number, required: true},
  }]
}, {timestamps: true});

const TimetableMDL = mongoose.model('timetable', timetableSchema);
module.exports = TimetableMDL;

