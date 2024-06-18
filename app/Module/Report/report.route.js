const express = require("express");
const router = express.Router();
const reportController = require("./report.controller");
const { validateResult } = require("../../Middleware/validateResult");


router.get('/transaction/report', validateResult, reportController.transaction)
router.get('/patient/report', validateResult, reportController.patient)
router.get('/patientInfo/report', validateResult, reportController.patientInfoWhoIsBooked)


module.exports = router;