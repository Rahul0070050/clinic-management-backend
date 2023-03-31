const express = require("express");
const connect = require("./src/connection/db");

const app = express()

// db connection
app.set(connect((err) => {
    if(err) {
        console.log(err.message);
        return;
    }
    console.log("db connected");
}))

app.listen(5000, () => console.log("server started"))