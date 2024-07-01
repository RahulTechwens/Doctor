const express = require("express");
const router = express.Router();
const { validateResult } = require("../../Middleware/validateResult");
const userController = require("../User/user.controller");
const { completeValidateResult } = require("./user.middilware");

router.post("/", validateResult, userController.createUser);
// router.post("/update", validateResult, userController.updateUser);
router.post("/update", validateResult, completeValidateResult, userController.updateUser);
router.get("/", validateResult, userController.listUser);
router.get("/package/:userId", userController.listPackage);
router.get("/amount/:userId", userController.userAmount);

module.exports = router;
