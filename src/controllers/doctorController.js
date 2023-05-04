const jwt = require("jsonwebtoken");
const passwordHash = require("password-hash");

const Doctors = require("../model/Doctor");
const Slots = require("../model/Slote");
const verifyToken = require("../utils/verifyToken");

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
    },
    getInfo: (req, res) => {
        let token = req.headers.authorization.split(' ')[1];
        verifyToken(token).then((info) => {
            res.status(200).json({ info })
        })
    },
    addSlots: async (req, res) => {
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
                    res.status(200).json()
                })
            }
        }
    },
    getAllDoctors: (req, res) => {
        return new Promise((resolve, reject) => {
            Doctors.find({}).then(response => {
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
    }
}