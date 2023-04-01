const passwordHash = require("password-hash");

module.exports = {
    checkPassword: (password,hashedPassword) => {
        return passwordHash.verify(password,hashedPassword)
    }
}