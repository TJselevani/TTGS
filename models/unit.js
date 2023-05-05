const mongoose= require("mongoose");
const Schema = mongoose.Schema;

const unitSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    semester: {
        type: String,
        required: true
    },
    course: {
        type: String,
        required: true
    },
    isAssigned: {
        type: Boolean,
        default: false
    },
    lecturer: {   
        type: String,
        default: '' 
    },
    isAlloted: {
        type: Boolean,
        default: false
    },
    room: {   
        type: String,
        default: '' 
    },
    substitute: {
        type: String, 
        default: ''   
    }
}, {timestamps: true});

const UnitMDL = mongoose.model('unit', unitSchema);
module.exports = UnitMDL;