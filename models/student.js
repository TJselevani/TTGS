const mongoose= require("mongoose");
const Schema = mongoose.Schema;

const studentSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    units: {
        type: String,
        required: true
    },
    semester: {
        type: String,
        required: true
    }
}, {timestamps: true});

const StudentMDL = mongoose.model('student', studentSchema);
module.exports = StudentMDL;