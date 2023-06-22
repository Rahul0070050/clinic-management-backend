const express = require("express");

const adminController = require("../controllers/adminController");
const adminAuth = require("../middlewares/adminAuth");

const router = express.Router();

router.post('/login', adminController.login);
router.post('/add-doctor', adminAuth, adminController.addDoctor);
router.get('/get-all-doctors', adminAuth, adminController.getAllDoctors);
router.get('/get-all-patients', adminAuth, adminController.getAllPatients);
router.get('/get-all-users', adminAuth, adminController.getAllUser);
router.get('/get-doctor/:id', adminAuth, adminController.getDoctor);
router.post('/update-doctor', adminAuth, adminController.updateDoctor);
router.get('/get-appointments', adminAuth, adminController.getAppointments);
router.get('/cancel-appointment/:id', adminAuth, adminController.cancelAppointment);
router.get('/get-all-payments', adminAuth, adminController.getAllPayments);
router.post('/add-department', adminAuth, adminController.addDepartment);
router.get('/get-all-department', adminAuth, adminController.getAllDepartment);
router.get('/delate-department/:id', adminAuth, adminController.deleteDepartment);
router.post('/edit-department', adminAuth, adminController.editDepartment);
router.get('/block-user/:id', adminAuth, adminController.blockUser);
router.get('/get-info', adminAuth, adminController.getInfo);
router.get('/get-departments', adminAuth, adminController.getDepartments);
router.get('/block-doctor/:id', adminAuth, adminController.blockDoctor);

module.exports = router;