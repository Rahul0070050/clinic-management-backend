const jwt = require("jsonwebtoken");
const passwordHash = require("password-hash");
const { ISODate, ObjectId } = require("bson");

const verifyToken = require("../utils/verifyToken");
const Appointments = require("../model/Appointments");

const Doctors = require("../model/Doctor");
const Slots = require("../model/Slote");
const Patients = require("../model/Patients");
const Departments = require("../model/Departments");

module.exports = {
    login: async (req, res) => {
        try {
            const { username, password } = req.body
            const errMessage = {
                username: "",
                password: ""
            }
            if (username == "" || password == "") {
                for (const key in req.body) {
                    if (req.body[key] == "") {
                        errMessage[key] = "please provide " + key
                    } else {
                        delete errMessage[key]
                    }
                }
                return res.status(406).json({ ...errMessage })
            }
            Doctors.findOne({ username }).then(async response => {
                if (!response) {
                    return res.status(401).json({ username: "user not fount" })
                }
                if (passwordHash.verify(password, response.password)) {
                    response.password = ""
                    const token = await jwt.sign({ response }, process.env.KEY)
                    return res.status(200).json({ token, info: response })
                } else {
                    return res.status(401).json({ password: "password is incorrect" })
                }
            })
        } catch (error) {
            res.status(500).json("server Error")
        }
    },
    getInfo: (req, res) => {
        try {
            let token = req.headers.authorization.split(' ')[1];
            verifyToken(token).then((info) => {
                res.status(200).json({ info })
            })
        } catch (error) {
            res.status(500).json("server Error")
        }
    },
    addSlots: async (req, res) => {
        try {
            const { date, time } = req.body

            if (time.length <= 0) {
                return res.status(400).json({ message: "please provide time slot" })
            } else {
                let haveSlots = await Slots.findOne({ date })
                if (!haveSlots) {
                    new Slots({
                        date,
                        times: time
                    }).save().then(response => {
                        res.status(200).json()
                    })
                } else {
                    haveSlots.times = [...time]
                    haveSlots.save().then(() => {
                        res.status(200).json({ ok: true })
                    })
                }
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
    getDates: (req, res) => {
        try {
            Appointments.find({}).select('appointmentDate').then(response => {
                let dates = []
                response.map(item => {
                    dates.push(item.appointmentDate)
                })
                res.status(200).json({ dates: dates })
            })
        } catch (error) {
            res.status(500).json("server Error")
        }
    },
    getAppointments: (req, res) => {
        try {
            let date = new Date(req.params.date)
            date.setUTCHours(0, 0, 0, 0);
            date.setDate(date.getDate() + 1);

            let token = req.headers.authorization.split(' ')[1];
            const username = jwt.decode(token).response.username

            let day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()
            let month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
            let year = date.getFullYear()
            const myDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
            console.log(myDate);

            const startDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
            const endDate = new Date(`${year}-${month}-${day}T23:59:59.999Z`);

            Appointments.find({ doctorName: username }).then(result => {
                console.log(result);
                res.status(200).json(result)
            }).catch(err => {
                console.log(err);
            })
        } catch (error) {
            res.status(500).json("server Error")
        }
    },
    getAppointmentsDetails: (req, res) => {
        try {
            const { id } = req.params
            Appointments.findById(id).then(result => {
                res.status(200).json({ info: result })
            })
        } catch (error) {
            res.status(500).json("server Error")
        }
    },
    addPrescription: async (req, res) => {
        try {
            const { medicine, symptoms, appointmentInfo: {
                _id: appointmentId,
                appointmentTime,
                appointmentDate,
                userId,
                email,
                firstName,
                lastName,
                mobile,
                gender,
                dob,
                doctorName,
                department,
                age,
                address,
            } } = req.body

            let token = req.headers.authorization.split(' ')[1];
            const { username, _id: doctorId } = jwt.decode(token).response

            let patient = await Patients.findOne({ userId: userId, doctorId: doctorId })
            if (!patient) {
                new Patients({
                    userId,
                    doctorId,
                    email,
                    mobile,
                    gender,
                    firstName,
                    lastName,
                    dob,
                    doctorName,
                    department,
                    age,
                    address,
                    history: [{
                        date: appointmentDate,
                        time: appointmentTime,
                        symptoms,
                        prescription: medicine,
                    }]
                }).save().then(result => {
                    Departments.updateOne({ name: department }, { $inc: { patientsCount: 1 } }).then(() => { })
                    Appointments.updateOne({ doctorName: username, appointmentDate, appointmentTime }, { $set: { status: "finished" } }).then(result => {
                        res.status(200).json({ ok: true })
                    })
                })
            } else {
                patient.history.push(
                    {
                        date: appointmentDate,
                        time: appointmentTime,
                        symptoms,
                        prescription: medicine,
                    }
                )

                patient.save().then(result => {
                    Appointments.updateOne({ userId: userId, doctorName: username, appointmentDate, appointmentTime }, { $set: { status: "finished" } }).then(result => {
                        res.status(200).json({ ok: true })
                    })
                })
            }
        } catch (error) {
            res.status(500).json("server Error")
        }
    },
    cancelAppointment: (req, res) => {
        try {
            Appointments.updateOne({ _id: new ObjectId(req.params.id) }, {
                $set: {
                    status: "canceled"
                }
            }).then(result => {
                return res.status(200).json({ ok: true })
            })
        } catch (error) {
            res.status(500).json("server Error")
        }
    },
    getPatients: (req, res) => {
        try {
            let finalResponse = []

            let token = req.headers.authorization.split(' ')[1];
            const { _id, username } = jwt.decode(token).response

            Patients.find({ doctorName: username }).then(async response => {
                res.status(200).json({ allPatients: response })
            })
        } catch (error) {
            res.status(500).json("server Error")
        }
    },
    deletePatients: (req, res) => {
        try {
            const { id } = req.params
            Patients.deleteOne({ _id: new ObjectId(id) }).then(result => {
                res.status(200).json({ ok: true })
            })
        } catch (error) {
            res.status(500).json("server Error")
        }
    },
    getPatientInfo: (req, res) => {
        try {
            const { id } = req.params

            Patients.findById(id).then(async response => {
                res.status(200).json({ patient: response })
            })
        } catch (error) {
            res.status(500).json("server Error")
        }
    },
    getTodaysAppointments: (req, res) => {
        try {

            let date = new Date()
            date.setUTCHours(0, 0, 0, 0);
            // date.setDate(date.getDate() + 1);

            let token = req.headers.authorization.split(' ')[1];
            const { _id, username } = jwt.decode(token).response

            let day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()
            let month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
            let year = date.getFullYear()
            const myDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);

            const startDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
            const endDate = new Date(`${year}-${month}-${day}T23:59:59.999Z`);

            Appointments.find({ $and: [{ appointmentDate: { $gte: startDate } }, { appointmentDate: { $lte: endDate } }, { doctorName: { $eq: username } }] }).then(result => {
                res.status(200).json({ result })
            })
        } catch (error) {
            res.status(500).json("server Error")
        }
    },
    getProfile: (req, res) => {
        try {
            let token = req.headers.authorization.split(' ')[1];
            const { _id, username } = jwt.decode(token).response

            Doctors.findById(_id).then(result => {
                Patients.find({ doctorName: username }).then(patients => {
                    res.status(200).json({ ok: true, doctor: result, patients })
                })
            })
        } catch (error) {
            res.status(500).json("server Error")
        }
    }
}