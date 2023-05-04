const express = require("express");

const adminController = require("../controllers/adminController");

const router = express.Router();

router.post('/login',adminController.login);
router.post('/add-doctor',adminController.addDoctor);
router.get('/get-all-doctors',adminController.getAllDoctors);
router.get('/get-all-patients',adminController.getAllPatients);
router.get('/get-all-users',adminController.getAllUser);

module.exports = router;