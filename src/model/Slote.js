const mongoose = require("mongoose");

const Slot = new mongoose.Schema({
    date: String,
    times: Array
})

const Slots = mongoose.model("slots", Slot);
module.exports = Slots;