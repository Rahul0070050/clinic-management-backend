const jwt = require("jsonwebtoken");
const passwordHash = require("password-hash");

const Doctors = require("../model/Doctor");
const Users = require("../model/User");

const { checkPasswordHasSpecialCharacters, EMAILREGEX, stringHasAnyNumber } = require("../utils/constants");
const { Types: { ObjectId } } = require("mongoose");
const Patients = require("../model/Patients");
const Appointments = require("../model/Appointments");
const Payments = require("../model/Payments");
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
            if (process.env.ADMIN_USERNAME == username) {
                if (process.env.ADMIN_PASSWORD == password) {
                    const token = await jwt.sign({ username, password }, process.env.KEY);
                    return res.status(200).json({ token })
                } else {
                    return res.status(401).json({ password: "password is incorrect" })
                }
            } else {
                return res.status(401).json({ username: "username is invalid" })
            }
        } catch (error) {
            res.status(500).json("server Error")
        }
    },
    addDoctor: (req, res) => {
        try {
            return new Promise((resolve, reject) => {
                const errMessage = {
                    CTC: "",
                    experience: "",
                    age: "",
                    username: "",
                    password: "",
                    email: "",
                    mobile: "",
                    department: ""
                }
                const { CTC, experience, age, username, password, email, mobile, department } = req.body

                if (CTC == "" || experience == "" || age == "" || username == "" || password == "" || email == "" || mobile == "" || department == "") {
                    for (const key in req.body) {
                        for (const key in req.body) {
                            if (req.body[key] == "") {
                                errMessage[key] = "please provide "
                            } else {
                                delete errMessage[key]
                            }
                        }
                        return res.status(406).json({ ...errMessage, ok: false })
                    }
                } else {
                    if (!checkPasswordHasSpecialCharacters(password)) {
                        return res.status(406).json({ password: "please include special " })
                    }

                    if (!EMAILREGEX.test(email)) {
                        return res.status(406).json({ email: "invalid email " });
                    }


                    if (!stringHasAnyNumber(mobile)) {
                        return res.status(406).json({ mobile: "invalid mobile " });
                    }

                    Doctors.findOne({ username }).then(response => {
                        if (response) {
                            return res.status(409).json({ username: "username already exist" });
                        } else {
                            req.body.password = passwordHash.generate(req.body.password)
                            new Doctors({
                                ...req.body,
                                block: false
                            }).save().then(response => {
                                Departments.updateOne({ name: department }, { $inc: { doctorsCount: 1 } }).then(() => { })
                                res.status(200).json({ ok: true })
                            })
                        }
                    })

                }
            })
        } catch (error) {
            res.status(500).json("server Error")
        }
    },
    getAllDoctors: (req, res) => {
        const { count } = req.body
        try {
            Doctors.find({}).skip(count).limit(11).then(response => {
                res.status(200).json({ allDoctors: response, totalCount: response.length })
            })
        } catch (error) {
            res.status(500).json("server Error")
        }
    },
    getAllPatients: (req, res) => {
        try {
            Patients.find({}).then(response => {
                res.status(200).json({ allPatients: response })
            })
        } catch (error) {
            res.status(500).json("server Error")
        }
    },
    getAllUser: (req, res) => {
        try {
            Users.find({}).then(response => {
                console.log(response);
                res.status(200).json({ users: response })
            })
        } catch (error) {
            res.status(500).json("server Error")
        }
    },
    getDoctor: (req, res) => {
        try {
            const { id } = req.params
            Doctors.findById(id).then(response => {
                delete response.password
                res.status(200).json({ doctor: response })
            })
        } catch (error) {
            res.status(500).json("server Error")
        }
    },
    updateDoctor: (req, res) => {
        try {
            let doctorError = {
                CTC: "",
                age: "",
                department: "",
                email: "",
                experience: "",
                mobile: "",
                username: "",
                id: ""
            }

            let {
                CTC,
                age,
                department,
                email,
                experience,
                mobile,
                username,
                _id } = req.body


            if (CTC == "" || experience == "" || age == "" || username == "" || email == "" || mobile == "" || department == "") {
                for (const key in req.body) {
                    if (req.body[key] == "") {
                        doctorError[key] = "please provide "
                    } else {
                        delete doctorError[key]
                    }
                }
                res.status(406).json({ ...doctorError })
                return
            } else {

                if (mobile.length > 10 || mobile.length < 10) {
                    res.status(406).json({ mobile: "please provide valid " })
                    return
                }

                try {

                    Doctors.findOne({ username }).then(response => {
                        if (response && response._id != _id) {
                            return res.status(409).json({ username: "already exist " });
                        } else {
                            Doctors.updateOne({ _id: new ObjectId(_id) }, {
                                $set: {
                                    CTC,
                                    age,
                                    department,
                                    email,
                                    experience,
                                    mobile,
                                    username,
                                }
                            }).then(response => {
                                res.status(200).json({ ok: true })
                            })
                        }
                    })
                } catch (error) {
                    console.log(error);
                }
            }
        } catch (error) {
            res.status(500).json("server Error")
        }
    },
    deleteDoctor: (req, res) => {
        try {
            Doctors.deleteOne({ _id: new ObjectId(_id) }).then(result => {
                console.log(result);
            })
        } catch (error) {
            res.status(500).json("server Error")
        }
    },
    getAppointments: (req, res) => {
        try {
            Appointments.find({ status: "new" }).then(result => {
                res.status(200).json({ appointments: result, count: result.length })
            })
        } catch (error) {
            res.status(500).json("server Error")
        }
    },
    cancelAppointment: (req, res) => {
        try {
            console.log(req.body.params);
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
    deleteUser: (req, res) => {
        try {
            Users.deleteOne({ _id: new ObjectId(req.params.id) }).then(result => {
                res.status(200).json({ ok: true })
            })
        } catch (error) {
            res.status(500).json("server Error")
        }
    },
    getAllPayments: (req, res) => {
        try {
            Payments.find({}).then(result => {
                res.status(200).json({ result: result })
            })
        } catch (error) {
            res.status(500).json("server Error")
        }
    },
    getAllDepartment: (req, res) => {
        try {
            Departments.find({}).then(result => {
                res.status(200).json({ allDepartments: result })
            })
        } catch (error) {
            res.status(500).json("server Error")
        }
    },
    addDepartment: (req, res) => {
        try {
            const { departmentName } = req.body
            new Departments({
                name: departmentName,
                doctorsCount: 0,
                patientsCount: 0
            }).save().then(result => {
                res.status(200).json({ ok: true, result })
            })
        } catch (error) {
            res.status(500).json("server Error")
        }
    },
    deleteDepartment: (req, res) => {
        try {
            Departments.deleteOne({ _id: new ObjectId(req.params.id) }).then(result => {
                res.status(200).json({ ok: true })
            })
        } catch (error) {
            res.status(500).json("server Error")
        }
    },
    editDepartment: (req, res) => {
        try {
            console.log(req.body);
            const { departmentName, id } = req.body
            Departments.updateOne({ _id: new ObjectId(id) }, { $set: { name: departmentName } }).then(result => {
                res.status(200).json({ ok: true })
            })
        } catch (error) {
            res.status(500).json("server Error")
        }
    },
    blockUser: (req, res) => {
        try {
            const { id } = req.params;
            console.log(id);
            Users.updateOne({ _id: new ObjectId(id) },
                [
                    {
                        $set: {
                            block: {
                                $cond: {
                                    if: { $eq: ['$block', true] },
                                    then: false,
                                    else: true
                                }
                            }
                        }
                    }
                ]
            ).then(result => {
                console.log(result);
                res.status(200).json({ ok: true })
            })
        } catch (error) {
            res.status(500).json("server Error")
        }
    },
    getInfo: (req, res) => {
        try {
            Users.find({}).count().then(usersCount => {
                Patients.find({}).count().then(patientsCount => {
                    Departments.find({}).then(departmentCount => {
                        Doctors.find({}).then(doctorsCount => {
                            Appointments.find({}).count().then(appointmentsCount => {
                                res.status(200).json([[
                                    { name: "users", count: usersCount },
                                    { name: "patients", count: patientsCount },
                                    { name: "doctors", count: doctorsCount.length },
                                    { name: "department", count: departmentCount.length },
                                    { name: "Bookings", count: appointmentsCount },
                                ], [
                                    doctorsCount, departmentCount
                                ]])
                            })
                        })
                    })
                })
            })
        } catch (error) {
            res.status(500).json("server Error")
        }
    },
    getDepartments: (req, res) => {
        try {
            Departments.find({}).then(departments => {
                res.status(200).json({ departments })
            })
        } catch (error) {
            res.status(500).json("server Error")
        }
    },
    blockDoctor: (req, res) => {
        try {
            const { id } = req.params;
            console.log(id);
            Doctors.updateOne({ _id: new ObjectId(id) },
                [
                    {
                        $set: {
                            block: {
                                $cond: {
                                    if: { $eq: ['$block', true] },
                                    then: false,
                                    else: true
                                }
                            }
                        }
                    }
                ]
            ).then(result => {
                console.log(result);
                res.status(200).json({ ok: true })
            })
        } catch (error) {
            res.status(500).json("server Error")
        }
    }
}