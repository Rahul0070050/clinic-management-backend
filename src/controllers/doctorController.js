const jwt = require("jsonwebtoken");

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
                    errMessage[key] = "please provide "+key
                } else {
                    delete errMessage[key]
                }
            }
            return res.status(406).json({...errMessage})
        }
        if (process.env.DOCTOR_USERNAME == username) {
            if (process.env.DOCTOR_PASSWORD == password) {
                const token = await jwt.sign({ username,password }, process.env.KEY)
                return res.status(200).json({ token })
            } else {
                return res.status(401).json({password: "password is incorrect" })
            }
        } else {
            return res.status(401).json({ username: "username is invalid" })
        }
    }
}