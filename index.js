const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv");

const connect = require("./src/connection/db");

//routes imports
const userRoutes = require("./src/routes/userRoute");
const doctorRoutes = require("./src/routes/doctorRoute");
const adminRoutes = require("./src/routes/adminRoutes");

const app = express()

app.use(cors({
    origin: ["https://64880f548aa761686621227c--joyful-biscuit-543c68.netlify.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
}))

app.use(express.json());
app.use(bodyParser({ extended: false }));
app.use(express.urlencoded({ extended: true }));

// db connection
app.set(connect((err) => {
    if (err) {
        console.log(err.message);
        return;
    }
    console.log("db connected");
}))

// setup routes
app.use('/api/user', userRoutes) 
app.use('/api/doctor', doctorRoutes)
app.use('/api/admin', adminRoutes)

// error handler
app.use("*", (err, req, res, next) => {
    console.error(err.stack)
    next(err)
})

app.listen(5000, () => console.log("server started", 5000))