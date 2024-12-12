const express = require("express")

const app = express()

app.get("/", (req, res)=>{
    res.send("welcome to the blog")
})

app.listen(PORT, ()=>{
    console.log(`server is running on http://localhost:${PORT}`)
})