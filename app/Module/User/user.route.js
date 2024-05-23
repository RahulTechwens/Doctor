const express = require("express");
const router = express.Router();
const { validateResult } = require("../../Middleware/validateResult");
const userController = require("../User/user.controller");

router.post("/", validateResult, userController.createUser);
router.get("/", validateResult, userController.listUser);
router.get("/package/:userId", userController.listPackage);

module.exports = router;
