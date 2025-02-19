const express = require("express")
require("dotenv").config()
const authRoute = require("./routes/auth.route")
const blogRoute = require("./routes/blog.route")
const path = require("path")
const cookieParser = require('cookie-parser');
const userMiddleware = require("./middlewares/user.middleware")
const authMiddleware = require("./middlewares/auth.middleware")
var methodOverride = require('method-override')
// const  helmet = require("helmet") 
const UserModel = require("./models/user.model")

const app = express()
// app.use(helmet()) Helmet blocked images from cloudinary from displaying due to content security policy (csp),look into how to configure csp in helmet

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')))
app.set("views", "views")
app.set("view engine", "ejs")
app.use(cookieParser());
app.use(methodOverride('_method'))


app.use(userMiddleware.attachUserToLocals)
app.use("/auth", authRoute)

app.use("/blog", blogRoute)

app.use((req, res, next)=>{
   res.locals.user = req.user
   next()
})


app.get("/", userMiddleware.attachUserToLocals, (req, res)=>{
    res.render("index", { user: res.locals.user})
})

app.get("/create-new", authMiddleware.validateToken, (req, res)=>{
    res.render("create", {user: req.user})
})
app.get("/auth/signup", (req, res)=>{
    res.render("signup")
})

app.get("/auth/login", (req, res)=>{
    res.render("login")
})

app.get("/blog/author/:id", (req, res)=>{
    res.render("dashboard")
})

// reset or update readersAccess to an empty array
const resetReadersAccess = async () => {
    try{
        await UserModel.updateMany({}, { $set: { readersAccess: [] } });
        console.log('Reset readersAccess for all users');
    }catch(error){
        console.log("unable to reset readersAccess for all users", error.message)
    }
};
// Run the reset function every 24 hours (86400000 ms)
setInterval(resetReadersAccess, 86400000); 

app.use((error, req, res, next)=>{
    console.log('Path: ', req.path)
    console.error('Error: ', error.message)

    if(error){
        res.status(500).json({
            message:error.message
        })
    }
    next()
})

app.get('*',userMiddleware.attachUserToLocals, (req, res) => {
    res.status(404).render("notfound",{ message: 'Page not found', code: 404, user: res.locals.user })
})



module.exports = app;