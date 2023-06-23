const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const logger = require('./src/utils/logger');

const connect = require("./src/connection/db");

//routes imports
const userRoutes = require("./src/routes/userRoute");
const doctorRoutes = require("./src/routes/doctorRoute");
const adminRoutes = require("./src/routes/adminRoutes");

const app = express()

require("dotenv");

app.use(cors({
    origin: ["https://joyful-biscuit-543c68.netlify.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
}))

app.use(express.json());
app.use(bodyParser({ extended: false }));
app.use(express.urlencoded({ extended: true }));

// db connection
app.set(connect((err) => {
    if (err) {
        logger.info(err.message);
        return;
    }
    logger.info("db connected");
}))

// setup routes
app.use('/api/user', userRoutes)
app.use('/api/doctor', doctorRoutes)
app.use('/api/admin', adminRoutes)

// error handler
app.use("*", (err, req, res, next) => {
    logger.info(err.stack)
    next(err)
})

app.listen(5000, () => logger.info(`server started ${5000}`))