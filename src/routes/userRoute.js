const express = require("express");

const userController = require("../controllers/userController");
const userAuth = require("../middlewares/userAuth");

const router = express.Router();

router.post("/signup", userController.signup);
router.post('/login', userController.login);
router.get('/get-all-doctors', userController.getAllDoctors);
router.get('/get-slots', userAuth, userController.getSlots);
router.post('/book-appointment', userAuth, userController.bookAppointment);
router.get('/get-profile', userAuth, userController.getProfile);
router.get('/check-mobile/:mobile', userController.checkMobileNumber);
router.post('/reset-password', userController.resetPassword);
router.get("/get-all-appointments", userController.getAllAppointments);
router.post("/cancel-appointment/:id", userController.cancelAppointment);

module.exports = router;