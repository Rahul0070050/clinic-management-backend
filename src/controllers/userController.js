const passwordHash = require("password-hash");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const Users = require("../model/User");
const { EMAILREGEX } = require("../utils/constants");

module.exports = {
    signup: (req, res) => {
        let { username, password, confirmPassword, email } = req.body
        if (username == "" || password == "" || confirmPassword == "" || email == "") {
            return res.status(406).json({ message: "user data is not fulfilled" });
        }
        
        // Users.deleteMany({}).then((res) => {console.log(res)})
        if(!EMAILREGEX.test(email)) {
            return res.status(406).json({ message: "invalid email address" });
        }


        Users.find({ email }).then(response => {
            if (response.length > 0) {
                return res.status(409).json({ message: "email already exist" });
            } else {
                if (password != confirmPassword) {
                    return res.status(406).json({ message: "password is not matching" });
                }

                password = passwordHash.generate(password)
                new Users({
                    username,
                    password,
                    email
                }).save().then(async (response) => {
                    const token = await jwt.sign({ username, password, email }, process.env.KEY)
                    console.log(response);  
                    res.status(200).json({ token })
                })
            }
        })

    },
    login: (req, res) => {
        // console.log(req.body);
    }
}