const { model, Schema, Types: { ObjectId } } = require("mongoose");

const Patient = new Schema({
    userId: String,
    doctorId: String,
    email: String,
    mobile: String,
    gender: String,
    dob: String,
    doctorName: String,
    department: String,
    firstName: String,
    lastName: String,
    age: String,
    address: String,
    history: [
        {
            date: Date,
            time: String,
            symptoms: String,
            prescription: Object
        }
    ],
})

const Patients = model("patients", Patient);
module.exports = Patients;
