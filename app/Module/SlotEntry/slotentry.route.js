const express = require("express");
const router = express.Router();
const { validateResult } = require("../../Middleware/validateResult");
const slotEntryController = require("./slotentry.controller");
// const userController = require("../User/user.controller");

router.post("/entry", validateResult, slotEntryController.createSlotEntry);
router.get("/entry", validateResult, slotEntryController.getAllSlotEntry);

module.exports = router;
