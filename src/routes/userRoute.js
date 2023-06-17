const express = require("express");

const userController = require("../controllers/userController");
const userAuth = require("../middlewares/userAuth");

const router = express.Router();

router.post("/signup", userController.signup);
router.post("/is-user-exist", userController.checkUserExist);
router.post('/login', userController.login);
router.get('/get-all-doctors', userAuth, userController.getAllDoctors);
router.get('/get-slots', userAuth, userController.getSlots);
router.post('/book-appointment', userAuth, userController.bookAppointment);
router.get('/get-profile', userAuth, userController.getProfile);
router.get('/check-mobile/:mobile', userController.checkMobileNumber);
router.post('/reset-password', userAuth, userController.resetPassword);
router.get("/get-all-appointments", userAuth, userController.getAllAppointments);
router.post("/cancel-appointment/:id", userAuth, userController.cancelAppointment);

module.exports = router;