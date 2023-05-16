const passwordHash = require("password-hash");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const Users = require("../model/User");
const { EMAILREGEX, checkPasswordHasSpecialCharacters, stringHasAnyNumber } = require("../utils/constants");
const { checkPassword } = require("../helpers/userHelper");
const Doctors = require("../model/Doctor");
const Slots = require("../model/Slote");
const Appointments = require("../model/appointments");
const Payments = require("../model/payments");
const { Types: { ObjectId } } = require("mongoose");

module.exports = {
    signup: (req, res) => {
        let errorMessages = {
            firstName: "",
            lastName: "",
            email: "",
            mobile: "",
            dateOfBirth: "",
            gender: "",
            password: "",
            confirmPassword: ""
        }

        let {
            firstName,
            lastName,
            email,
            mobile,
            dateOfBirth,
            gender,
            password,
            confirmPassword,
        } = req.body

        if (firstName == "" ||
            lastName == "" ||
            email == "" ||
            mobile == "" ||
            dateOfBirth == "" ||
            gender == "" ||
            password == "" ||
            confirmPassword == "") {

            for (const key in req.body) {
                if (req.body[key] == "") {
                    errorMessages = { ...errorMessages, [key]: "please provide " + key }
                } else {
                    delete errorMessages[key];
                }
            }

            res.status(406).json({ ...errorMessages })
            return;
        }

        if (!checkPasswordHasSpecialCharacters(password)) {
            return res.status(406).json({ password: "please include special characters" })
        }

        if (password != confirmPassword) {
            return res.status(406).json({ confirmPassword: "password is not matching" })
        }

        if (!EMAILREGEX.test(email)) {
            return res.status(406).json({ email: "invalid email address" });
        }


        if (!stringHasAnyNumber(mobile)) {
            return res.status(406).json({ mobile: "invalid mobile number" });
        }

        try {

            Users.find({ email }).then(response => {
                if (response.length > 0) {
                    return res.status(409).json({ email: "email already exist" });
                } else {

                    password = passwordHash.generate(password);

                    new Users({
                        firstName,
                        lastName,
                        email,
                        mobile,
                        dateOfBirth,
                        gender,
                        password,
                    }).save().then(async (response) => {
                        delete req.body.password
                        const token = await jwt.sign({ ...req.body }, process.env.KEY)
                        res.status(200).json({ token })
                    })
                }
            })
        } catch (error) {
            throw new Error(error)
        }

    },
    login: (req, res) => {
        try {
            const { email, password } = req.body
            if (email == "" || password == "") {
                return res.status(406).json({ message: "please provide valid details" })
            }

            Users.find({ email }).then(async (user) => {
                if (user.length <= 0) {
                    return res.status(406).json({ type: 'email', message: "user mot found" })
                } else {
                    user = user[0];
                    if (checkPassword(password, user.password)) {
                        const token = await jwt.sign({ ...user }, process.env.KEY)
                        return res.status(200).json({ token, user })
                    } else {
                        return res.status(401).json({ type: "password", message: "incurrent password" })
                    }
                }
            })
        } catch (error) {
            return res.status(500).json({ message: error.message })
        }
    },
    getAllDoctors: (req, res) => {
        return new Promise((resolve, reject) => {
            Doctors.find({}).then(response => {
                console.log(response);
                for (let i = 0; i < response.length; i++) {
                    delete response[i].password
                }
                res.status(200).json({ doctors: response })
            })
        })

    },
    getSlots: (req, res) => {
        Slots.find({}).then(response => {
            res.status(200).json({ slots: response })
        })
    },
    bookAppointment: (req, res) => {
        const { firstName,
            lastName,
            email,
            mobile,
            gender,
            dob,
            appointmentTime,
            appointmentDate,
            doctorName,
            department,
            age,
            address, } = req.body

        const formData = {
            firstName: false,
            lastName: false,
            email: false,
            mobile: false,
            gender: false,
            dob: false,
            appointmentTime: false,
            appointmentDate: false,
            doctorName: false,
            department: false,
            age: false,
            address: false,
        }


        if (firstName == "" ||
            lastName == "" ||
            email == "" ||
            mobile == "" ||
            gender == "" ||
            dob == "" ||
            appointmentTime == "" ||
            appointmentDate == "" ||
            doctorName == "" ||
            department == "" ||
            age == "" ||
            address == "") {

            for (const key in req.body) {
                if (req.body[key] == "") {
                    formData[key] = true
                } else {
                    delete formData[key]
                }
            }


            res.status(406).json({ ...formData })
        } else {
            Slots.findOne({ date: appointmentDate }).then(async result => {
                let slot = result.times.find(time => time.time == appointmentTime)
                for (const key in slot) {
                    if (key == "booked" && slot.booked) {
                        return res.status(406).json({ ok: false, msg: 'slot already booked' })
                    }
                }

                let token = req.headers.authorization.split(' ')[1];

                let data = await jwt.decode(token)

                req.body.userId = data._doc._id
                req.body.status = "new"
                
                console.log(req.body);
                new Appointments({ ...req.body }).save().then(result => { })

                Slots.findOne({ date: appointmentDate }).then(async result => {
                    result.times.filter(time => {
                        if (time.time == appointmentTime) {
                            time.booked = true
                        }
                        return time
                    })
                    new Payments({
                        userId: data._doc._id,
                        amount: 40,
                        email: data._doc.email
                    }).save().then(() => {
                    })
                    await result.save()
                    res.status(200).json({ ok: true })
                })
            })
        }
    }
}