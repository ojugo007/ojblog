const joi = require("joi")


const blogSchema = joi.object({
    title: joi.string()
        .required()
        .min(5)
        .max(225),
    description: joi.string()
        .required()
        .min(10)
        .max(500),
    body: joi.string()
        .required()
        .min(500),
    state: joi.string()
        .required(),
    tags: joi.string()
        .required()

})

const updateBlogSchema = joi.object({
    title: joi.string()
        .min(5)
        .max(225),
    description: joi.string()
        .optional()
        .min(10)
        .max(500),
    body: joi.string()
        .optional()
        .min(500),
    state: joi.string()
        .optional(),
    tags: joi.string()
        .optional(),

})

const blogPostValidation = async(req, res, next)=>{
    const blogPayload = req.body
    try{
        await blogSchema.validateAsync(blogPayload)
        next();
    }catch(err){
        console.log(err)
        next({
            message: err.message
        })
    }

}

const blogUpdateValidation = async(req,res,next)=>{
    const blogPayload = req.body
    try{
        await updateBlogSchema.validateAsync(blogPayload)
        next();
    }catch(err){
        next({
            message: err.message
        })
    }
}

module.exports = {
    blogPostValidation,
    blogUpdateValidation
}

