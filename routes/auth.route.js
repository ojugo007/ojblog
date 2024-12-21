const express = require("express")
const authController = require("../controllers/auth.controller")

const route = express.Router()


route.post("/login", authController.Login )

route.post("/signup", authController.Signup )

module.exports = route