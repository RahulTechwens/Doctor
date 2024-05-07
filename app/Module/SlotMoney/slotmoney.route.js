const express = require("express");
const router = express.Router();

const slotMoneyController = require("./slotmoney.controller");
const { validateResult } = require("../../Middleware/validateResult");


router.post('/add/money', validateResult, slotMoneyController.addSlotMoney)
router.get('/money', validateResult, slotMoneyController.getSlotMoney)

module.exports = router;
