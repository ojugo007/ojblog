const express = require("express")
require("dotenv").config()
const connectToMongoDB = require("./db")

const PORT = process.env.PORT

const app = express()
connectToMongoDB()

app.get("/", (req, res)=>{
    res.send("welcome to the blog")
})

app.listen(PORT, ()=>{
    console.log(`server is running on http://localhost:${PORT}`)
})