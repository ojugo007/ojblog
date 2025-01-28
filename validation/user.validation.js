const joi = require("joi")


const userSignupSchema = joi.object({
    first_name:joi.string()
        .min(2)
        .max(20)
        .required(),
    
    last_name:joi.string()
        .min(2)
        .max(20)
        .required(),
    email:joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
        .required(),
    password: joi.string()
      .pattern(new RegExp("^[a-zA-Z0-9]{7,30}$"))
      .required()
      .messages({
        "string.pattern.base": `Password should be between 7 to 30 characters and contain letters or numbers only`,
        "string.empty": `Password cannot be empty`,
        "any.required": `Password is required`,
      }),
})

const userLoginSchema = joi.object({
    email: joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
        .required(),
    password:joi.string()
        .pattern(new RegExp("^[a-zA-Z0-9]{7,30}$"))
        .required()
        .messages({
            "string.pattern.base": `Password should be between 7 to 30 characters and contain letters or numbers only`,
            "string.empty": `Password cannot be empty`,
            "any.required": `Password is required`,
        }),
})

const validateSignup = async(req, res, next)=>{
    const authPayload = req.body
    try{
        await userSignupSchema.validateAsync(authPayload)
        next()
    }catch(err){
        next({
            message:err.message
        })
    
    }

}

const validateLogin = async(req, res, next)=>{
    const authPayload = req.body
    try{
        await userLoginSchema.validateAsync(authPayload)
        next()
    }catch(err){
        next({
            message : err.message
        })
    
    }

}


module.exports = {
    validateSignup,
    validateLogin
}