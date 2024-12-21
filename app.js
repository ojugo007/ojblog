const express = require("express")
require("dotenv").config()
const connectToMongoDB = require("./db")
const authRoute = require("./routes/auth.route")
const blogRoute = require("./routes/blog.route")
const path = require("path")
const cookieParser = require('cookie-parser');
const userMiddleware = require("./middlewares/user.middleware")
const authMiddleware = require("./middlewares/auth.middleware")
var methodOverride = require('method-override')

const PORT = process.env.PORT

const app = express()
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json());
app.set("views", "views")
app.set("view engine", "ejs")
app.use(cookieParser());
app.use(methodOverride('_method'))

connectToMongoDB()
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

app.use((error, req, res, next)=>{
    console.log('Path: ', req.path)
    console.error('Error: ', error)

    if(error){
        res.status(500).json({
            message:err.message
        })
    }
    next()
})

app.get('*', (req, res) => {
    res.json({ message: 'Route not found', code: 404 })
})

app.listen(PORT, ()=>{
    console.log(`server is running on http://localhost:${PORT}`)
})