const mongoose = require("mongoose")


const connectToMongoDB = ()=>{
    mongoose.connect(process.env.MONGO_DB_CONNECTION_URL)

    mongoose.connection.on("connected", ()=>{
        console.log("successfully connected to MongoDB")
    })

    mongoose.connection.on("error", (err)=>{
        console.log("failed to connect to MongoDB", err)
    })

}


module.exports = connectToMongoDB