const Users = require("../model/User");
const verifyToken = require("../utils/verifyToken");
const jwt = require('jsonwebtoken')

function userAuth(req, res, next) {
    let token = req.headers.authorization.split(' ')[1];
    verifyToken(token).then(async (data) => {
        Users.findById(data?._id).then(result => {
            if (result?.block) {
                return res.status(400).json({ block: true })
            } else {
                next()
            }
        })
    }).catch(() => {
        res.status(400).json({ logedIn: false })
    })

}
module.exports = userAuth