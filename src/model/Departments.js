const mongoose = require("mongoose");

const Department = new mongoose.Schema({
    name: String,
    doctorsCount: Number,
    patientsCount: Number,
})

const Departments = mongoose.model("departments", Department);
module.exports = Departments;
