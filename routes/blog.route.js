const express = require("express")
const blogController = require("../controllers/blog.controller")
const authMiddleware = require("../middlewares/auth.middleware")
const { blogPostValidation, blogUpdateValidation} = require("../validation/post.validation")
const limiterMiddleware = require("../middlewares/readLimiter.middleware")
const multer = require("multer")

const route = express.Router()

const upload = multer({dest:"uploads"})

route.post("/", upload.single('image_url'), authMiddleware.validateToken, blogController.createBlog)

route.get("/", blogController.getAllPublishedBlogs)

route.get("/:id", authMiddleware.validateToken, limiterMiddleware.readLimiter, blogController.getBlogById)

route.get("/:id/edit-article", authMiddleware.validateToken, blogController.getUpdateBlogId)

route.post("/:id/edit-article", blogUpdateValidation, authMiddleware.validateToken, blogController.updateBlog) 

route.get("/author/:id", authMiddleware.validateToken, blogController.getThisAuthorBlogs)

route.delete("/:id/delete", authMiddleware.validateToken, blogController.deleteBlog)

module.exports = route