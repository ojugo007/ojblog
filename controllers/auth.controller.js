const authService = require('../services/auth.service')
const UserModel = require("../models/user.model")

const Login = async(req, res)=>{
    const payload = req.body

    const loginResponse = await authService.Login({
        email : payload.email, 
        password : payload.password
    })
    
    res.cookie('token', loginResponse.data.token, {
        httpOnly: true, 
        secure: false, 
        maxAge: 3600000, 
        sameSite: 'Strict',
    });

    res.status(loginResponse.code).redirect(`/blog/author/${loginResponse.data.id}`)

    // res.status(loginResponse.code).json({message: loginResponse})

}

const Signup = async(req, res)=>{

    const payload = req.body
    if(!payload){
        return res.status(400).json({message:"invalid credentials"});
    }
    const newUser = new UserModel({
        first_name : payload.first_name,
        last_name : payload.last_name,
        email : payload.email,
        password : payload.password
    })

    const signupResponse = await authService.Signup(newUser)

    res.cookie('token', signupResponse.data.token, {
        httpOnly: true, 
        secure: false, 
        maxAge: 3600000, 
        sameSite: 'Strict',
    });

   
   
    res.status(signupResponse.code).redirect(`/blog/author/${signupResponse.data.id}` )
    // res.status(signupResponse.code).json({message: signupResponse})
    

}
module.exports = {
    Login,
    Signup
}