const express = require("express");
const login = express.Router();
const AuthController = require("../controllers/authController");

login.post("/", AuthController.login);

module.exports = login;
