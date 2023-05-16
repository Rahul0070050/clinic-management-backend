const mongoose = require("mongoose");

const Slot = new mongoose.Schema({
    date: String,
    times: [
        {
            booked: Boolean,
            time: String,
            selected: Boolean,
            doctor: String,
        }
    ]
})

const Slots = mongoose.model("slots", Slot);
module.exports = Slots;