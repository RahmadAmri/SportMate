const express = require("express");
const register = express.Router();
const AuthController = require("../controllers/authController");

register.post("/", AuthController.register);

module.exports = register;
