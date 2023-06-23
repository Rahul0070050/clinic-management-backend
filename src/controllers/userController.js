const passwordHash = require("password-hash");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const Users = require("../model/User");
const { EMAILREGEX, checkPasswordHasSpecialCharacters, stringHasAnyNumber } = require("../utils/constants");
const { checkPassword } = require("../helpers/userHelper");
const Doctors = require("../model/Doctor");
const Slots = require("../model/Slote");
const Appointments = require("../model/Appointments");
const Payments = require("../model/Payments");
const { Types: { ObjectId } } = require("mongoose");
const Patients = require("../model/Patients");
const logger = require("../utils/logger");

module.exports = {
    signup: (req, res) => {
        try {
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

                Users.find({ $or: [{ email }, { mobile }] }).then(response => {
                    if (response?.length > 0) {
                        if (response[0].email == email) {
                            return res.status(409).json({ email: "email already exist" });
                        } else {
                            return res.status(409).json({ mobile: "mobile number already exist" });
                        }
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
                            block: false
                        }).save().then(async (response) => {
                            logger.info(response);
                            const token = await jwt.sign({ ...response }, process.env.KEY)
                            res.status(200).json({ token })
                        })
                    }
                })
            } catch (error) {
                throw new Error(error)
            }

        } catch (error) {
            res.status(500).json("server Error")
        }
    },
    checkUserExist: (req, res) => {
        try {
            let { email, mobile } = req.body
            logger.info(req.body);
            Users.findOne({ $or: [{ email }, { mobile }] }).then(response => {
                if (response?.email == email) {
                    return res.status(409).json({ email: "email already exist" });
                } else if (response?.mobile == mobile) {
                    return res.status(409).json({ mobile: "mobile already exist" });
                } else {
                    return res.status(200).json({ ok: true });
                }
            })
        } catch (error) {
            res.status(500).json("server Error")
        }
    },
    login: (req, res) => {
        try {
            try {
                const { email, password } = req.body
                if (email == "" || password == "") {
                    return res.status(406).json({ message: "please provide valid details" })
                }

                Users.find({ email }).then(async (user) => {
                    logger.info(user);
                    if (user?.block) {
                        return res.status(400).json({ type: 'email', message: "this user has been blocked" })
                    }
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
        } catch (error) {
            res.status(500).json("server Error")
        }
    },
    getAllDoctors: (req, res) => {
        try {
            return new Promise((resolve, reject) => {
                Doctors.find({}).then(response => {
                    for (let i = 0; i < response.length; i++) {
                        delete response[i].password
                    }
                    res.status(200).json({ doctors: response })
                })
            })

        } catch (error) {
            res.status(500).json("server Error")
        }
    },
    getSlots: (req, res) => {
        try {
            Slots.find({}).then(response => {
                res.status(200).json({ slots: response })
            })
        } catch (error) {
            res.status(500).json("server Error")
        }
    },
    bookAppointment: (req, res) => {
        try {
            logger.info(req.body);
            const {
                firstName,
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
                    new Appointments({ ...req.body }).save().then(result => { })

                    result.times.filter(time => {
                        if (time.time == appointmentTime) {
                            time.booked = true
                        }
                        return time
                    })
                    new Payments({
                        firstName: firstName,
                        lastName: lastName,
                        mobile: mobile,
                        email: email,
                        userId: data._doc._id,
                        amount: 40,
                    }).save().then(() => {
                    })
                    await result.save()
                    res.status(200).json({ ok: true })
                })
            }
        } catch (error) {
            res.status(500).json("server Error")
        }
    },
    getProfile: async (req, res) => {
        try {
            let token = req.headers.authorization.split(' ')[1];

            let data = await jwt.decode(token)

            let id = data._doc._id

            Users.findById(id).then(result => {
                Patients.findOne({ userId: id }).then(history => {
                    if (history) {
                        res.status(200).json({ ok: true, history: history.history, user: result })
                    } else {
                        res.status(200).json({ ok: true, user: result })
                    }
                })
            })
        } catch (error) {
            res.status(500).json("server Error")
        }
    },
    checkMobileNumber: (req, res) => {
        try {
            const { mobile } = req.params;
            Users.find({ mobile }).then(result => {
                if (result.length <= 0) {
                    res.status(406).json({ ok: false, mobile: "mobile number not found" })
                } else {
                    res.status(200).json({ ok: true })
                }
            })
        } catch (error) {
            res.status(500).json("server Error")
        }
    },
    resetPassword: (req, res) => {
        try {
            let { password, confirmPassword, mobile } = req.body
            if (password != confirmPassword) {
                return res.status(200).json({ ok: false, msg: "password in not matching" })
            } else {
                password = passwordHash.generate(password);
                Users.updateOne({ mobile: `+91${mobile}` }, { $set: { password: password } }).then(result => {
                    res.status(200).json({ ok: true })
                })
            }
        } catch (error) {
            res.status(500).json("server Error")
        }
    },
    getAllAppointments: async (req, res) => {
        try {
            let token = req.headers.authorization.split(' ')[1];
            let data = await jwt.decode(token)
            let id = data._doc._id


            let date = new Date()
            date.setUTCHours(0, 0, 0, 0);

            let day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()
            let month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
            let year = date.getFullYear()

            const newDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
            logger.info(day, month, year);

            Appointments.find({ $and: [{ appointmentDate: { $lt: newDate } }, { userId: { $eq: id } }] }).then(oldAppointments => {
                Appointments.find({ $and: [{ appointmentDate: { $gte: newDate } }, { userId: { $eq: id } }] }).then(newAppointments => {
                    res.status(200).json({ oldAppointments, newAppointments })
                }).catch(err => {
                    logger.info(err);
                })
            }).catch(err => {
                logger.info(err);
            })
        } catch (error) {
            logger.info(error);
            res.status(500).json("server Error")
        }
    },
    cancelAppointment: (req, res) => {
        try {
            const { id } = req.params
            Appointments.updateOne({ _id: new ObjectId(id) }, { $set: { status: "canceled" } }).then(result => {
                res.status(200).json({ ok: true })
            })
        } catch (error) {
            res.status(500).json("server Error")
        }
    }
}