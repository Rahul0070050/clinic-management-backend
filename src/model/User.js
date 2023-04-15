const mongoose = require("mongoose");

const User = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    mobile: String,
    dateOfBirth: String,
    gender: String,
    password: String,
})

const Users = mongoose.model("users", User);
module.exports = Users;