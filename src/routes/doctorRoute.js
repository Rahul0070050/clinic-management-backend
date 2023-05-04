const express = require("express");

const doctorController = require("../controllers/doctorController");
const doctorAuth = require("../middlewares/doctorAuth");

const router = express.Router();

router.post('/login', doctorController.login);
router.post('/add-slots', doctorAuth, doctorController.addSlots);
router.get('/get-slots', doctorAuth, doctorController.getSlots);
router.get('/get-all-doctors', doctorAuth, doctorController.getAllDoctors);
router.get('/get-info', doctorAuth, doctorController.getInfo);
module.exports = router;