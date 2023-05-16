const express = require("express");

const doctorController = require("../controllers/doctorController");
const doctorAuth = require("../middlewares/doctorAuth");

const router = express.Router();

router.post('/login', doctorController.login);
router.post('/add-slots', doctorAuth, doctorController.addSlots);
router.get('/get-slots', doctorAuth, doctorController.getSlots);
router.get('/get-all-doctors', doctorAuth, doctorController.getAllDoctors);
router.get('/get-info', doctorAuth, doctorController.getInfo);
router.get('/get-appointments/:date', doctorAuth, doctorController.getAppointments);
router.get('/get-dates', doctorAuth, doctorController.getDates);
router.get('/get-appointment-info/:id', doctorAuth, doctorController.getAppointmentsDetails);
router.post('/add-prescription', doctorAuth, doctorController.addPrescription);
router.get('/cancel-appointment/:id', doctorAuth, doctorController.cancelAppointment);
router.get('/get-patients', doctorAuth, doctorController.getPatients);
router.get('/delete-patient/:id', doctorAuth, doctorController.deletePatients);
router.get('/get-patient-info/:id', doctorAuth, doctorController.getPatientInfo);

module.exports = router;
