const { verify, decode } = require('jsonwebtoken')

module.exports = function verifyToken(token) {
    return new Promise((resolve, reject) => {
        verify(token, process.env.KEY, function (err, decoded) {
            if (err) {
                reject(err)
            } else {
                resolve(decoded._doc)
            }
        });
    })
}