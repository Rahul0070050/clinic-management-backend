const express = require("express");
const cors = require("cors");
require("dotenv");

const connect = require("./src/connection/db");

//routes imports
const userRoutes = require("./src/routes/userRoute");
const bodyParser = require("body-parser");
// const doctorRoutes = require("./src/routes/doctorRoute");

const app = express()


app.use(cors({
    origin: ["http://localhost:5173"],
    methods: ["GET","POST","PUT","DELETE","PATCH"],
    credentials: true
}))

app.use(express.json());
app.use(bodyParser({extended: false}));
app.use(express.urlencoded({extended: true}));

// db connection
app.set(connect((err) => {
    if(err) {
        console.log(err.message);
        return;
    }
    console.log("db connected");
}))

// setup routes
app.use('/api/user',userRoutes)
// app.use('/api/doctor',doctorRoutes)

app.listen(5000, () => console.log("server started"))