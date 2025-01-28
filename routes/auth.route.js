const express = require("express")
const authController = require("../controllers/auth.controller")
const {validateSignup, validateLogin} = require("../validation/user.validation")

const route = express.Router()


route.post("/login", validateLogin, authController.Login )

route.post("/signup", validateSignup, authController.Signup )

module.exports = route