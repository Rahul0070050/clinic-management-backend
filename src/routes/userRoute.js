const express = require("express");

const userController = require("../controllers/userController");
const userAuth = require("../middlewares/userAuth");

const router = express.Router();

router.post("/signup", userController.signup);
router.post('/login', userController.login);
router.get('/get-all-doctors', userAuth, userController.getAllDoctors);
router.get('/get-slots', userAuth, userController.getSlots);
router.post('/book-appointment', userAuth, userController.bookAppointment);

module.exports = router;