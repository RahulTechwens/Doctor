const express = require("express");
const router = express.Router();

const slotBookController =  require("./slotbook.controller");
const { validateResult } = require("../../Middleware/validateResult");


router.post("/", validateResult, slotBookController.bookSlot);
router.get("/", validateResult, slotBookController.getBookSlot);
router.get('/details', validateResult, slotBookController.getUserWiseSlotBooked);


module.exports = router;
