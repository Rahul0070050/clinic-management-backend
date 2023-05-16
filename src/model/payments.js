const {Schema,model, Types: { ObjectId } } = require("mongoose");

const Payment = new Schema({
    userId: String,
    paymentName: String,
    amount: Number,
    userId: String,
})

const Payments = model("payments", Payment);
module.exports = Payments;
