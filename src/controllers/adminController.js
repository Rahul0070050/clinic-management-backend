const jwt = require("jsonwebtoken");
const passwordHash = require("password-hash");

const Doctors = require("../model/Doctor");
const Users = require("../model/User");

const { checkPasswordHasSpecialCharacters, EMAILREGEX, stringHasAnyNumber } = require("../utils/constants");

module.exports = {
    login: async (req, res) => {
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
    },
    addDoctor: (req, res) => {
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
                            ...req.body
                        }).save().then(response => {
                            res.status(200).json({ ok: true })
                        })
                    }
                })

            }
        })
    },
    getAllDoctors: (req, res) => {
        Doctors.find({}).then(response => {
            res.status(200).json({ allDoctors: response })
        })
    },
    getAllPatients:(req,res) => {
        Users.find({}).then(response => {
            res.status(200).json({ allPatients: response })
        })
    },
    getAllUser:(req,res) => {
        Users.find({}).then(response => {
            res.status(200).json({ users: response })
        })
    }
}