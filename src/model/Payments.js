const {Schema,model, Types: { ObjectId } } = require("mongoose");

const Payment = new Schema({
    userId: String,
    paymentName: String,
    firstName: String,
    lastName: String,
    email: String,
    mobile: String,
    amount: Number,
    userId: String,
})

const Payments = model("payments", Payment);
module.exports = Payments;
