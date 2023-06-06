const mongoose= require("mongoose");
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, {timestamps: true});

const AdminMDL = mongoose.model('admin', adminSchema);
module.exports = AdminMDL;