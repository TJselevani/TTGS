const mongoose= require("mongoose");
const Schema = mongoose.Schema;

const departmentSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    }
}, {timestamps: true});

const DepartmentMDL = mongoose.model('department', departmentSchema);
module.exports = DepartmentMDL;