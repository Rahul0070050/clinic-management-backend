const express = require("express");

const userController = require("../controllers/doctorController");

const router = express.Router();

router.post('/login',userController.login);

module.exports = router;