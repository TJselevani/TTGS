const mongoose= require("mongoose");
const Schema = mongoose.Schema;

const classroomSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    capacity: {
        type: String,
        required: true
    }
}, {timestamps: true});

const ClassroomMDL = mongoose.model('classroom', classroomSchema);
module.exports = ClassroomMDL;