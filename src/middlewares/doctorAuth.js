const Doctors = require("../model/Doctor");
const verifyToken = require("../utils/verifyToken");
const jwt = require('jsonwebtoken')

function doctorAuth(req, res, next) {
    let token = req.headers.authorization.split(' ')[1];
    verifyToken(token).then(async () => {

        let token = req.headers.authorization.split(' ')[1];
        const { _id } = jwt.decode(token)?.response

        Doctors.findById(_id).then(result => {
            if (result.block) {
                res.status(400).json({ block: true })
            }
            else {
                next()
            }
        })
    }).catch(() => {
        res.status(400).json({ logedIn: false })
    })

}
module.exports = doctorAuth