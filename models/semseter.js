const mongoose= require("mongoose");
const Schema = mongoose.Schema;

const semesterSchema = new Schema({
    level: {
        type: String
    }
}, {timestamps: true});

const SemesterMDL = mongoose.model('semester', semesterSchema);
module.exports = SemesterMDL;