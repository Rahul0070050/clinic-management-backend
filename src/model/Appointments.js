const mongoose = require("mongoose");

const Appointment = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    mobile: String,
    gender: String,
    dob: String,
    appointmentTime: String,
    appointmentDate: Date,
    doctorName: String,
    department: String,
    age: String,
    address: String,
    status: String,
    userId: String,
})

const Appointments = mongoose.model("appointments", Appointment);
module.exports = Appointments;
