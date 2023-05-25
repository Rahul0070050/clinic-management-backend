const mongoose = require("mongoose");

const Doctor = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    mobile: String,
    department: String,
    CTC: String,
    age: String,
    experience: String,
    block: Boolean,
})

const Doctors = mongoose.model("doctors", Doctor);
module.exports = Doctors;
