const mongoose= require("mongoose");
const Schema = mongoose.Schema;

const lecturerSchema = new Schema({
    lecID: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    department: {
        type: String
    },
    unit: [{ }]
}, {timestamps: true});

const LecturerMDL = mongoose.model('lecturer', lecturerSchema);
module.exports = LecturerMDL;