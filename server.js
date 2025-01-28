const app = require("./app")
const connectToMongoDB = require("./db")
require("dotenv").config()

const PORT = process.env.PORT

connectToMongoDB()


app.listen(PORT, ()=>{
    console.log(`server is running on http://localhost:${PORT}`)
})