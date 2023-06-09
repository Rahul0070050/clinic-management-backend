const mongoose = require("mongoose");

module.exports = function connect(done) {
    try {
        mongoose.connect(`${process.env.MONGODB_CONNECTION}`, {
            useUnifiedTopology: true
        }).then((res) => {
            done()
        })
    } catch (error) {
        done(error)
    }
}
