const UserModel = require("../models/user.model")
require("dotenv").config()
const jwt = require("jsonwebtoken")

const Login = async({email, password})=>{
    try{
        const user = await UserModel.findOne({email})

        if(!user){
            return{
                code : 400,
                success: false,
                data: null,
                message: "Invalid credential"
            }
        }

        const validPass = await user.validatePassword(password)

        if(!validPass){
            return{
                code: 400,
                success: false,
                data: null,
                message: "Invalid credential"
            }
        }

        const token = jwt.sign({email:user.email}, process.env.JWT_SECRET)

        return{
            code:200,
            success: true,
            data: {
                user, 
                token,
                id : user._id
            },
            message: "Login Success"
        
        }
    }catch(err){
        console.log(err)
        return{
            code:500,
            success: false,
            data:null,
            message: "unexpected server error"
        
        }
    }
}

const Signup = async({email, password, first_name, last_name})=>{
    try{
        const userExist = await UserModel.findOne({email})
        if(userExist){
            return{
                code:409,
                success: false,
                data:null,
                message: "User with the email already exist"
            }
        }
        const user = await UserModel.create({first_name, last_name, email, password})

        const token = await jwt.sign({email}, process.env.JWT_SECRET, { expiresIn: '1h' })


        return{
            code: 201,
            success: true,
            data:{
                user,
                token,
                id: user._id
            },
            message: "user successfully signed up"
        }

    }catch(err){
        console.log(err)
        return{
            code:500,
            success: false,
            data:null,
            message: "unexpected server error"
        
        }
    
    }

}

module.exports = {
    Login,
    Signup
}