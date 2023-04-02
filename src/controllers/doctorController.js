const jwt = require("jsonwebtoken");

module.exports = {
    login: async (req, res) => {
        const { username, password } = req.body
        if (username == "" || password == "") {
            return res.status(406).json({ message: "please provide valid details" })
        }
        if (process.env.DOCTOR_USERNAME == username) {
            if (process.env.DOCTOR_PASSWORD == password) {
                const token = await jwt.sign({ username,password }, process.env.KEY)
                return res.status(200).json({ token })
            } else {
                return res.status(401).json({ message: "password is not matching" })
            }
        } else {
            return res.status(401).json({ message: "username is invalid" })
        }
    }
}