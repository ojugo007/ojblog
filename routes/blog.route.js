const express = require("express")
const blogController = require("../controllers/blog.controller")
const authMiddleware = require("../middlewares/auth.middleware")
const { blogPostValidation, blogUpdateValidation} = require("../validation/post.validation")

const route = express.Router()


route.post("/", blogPostValidation, authMiddleware.validateToken, blogController.createBlog)

route.get("/", blogController.getAllPublishedBlogs)

route.get("/:id", blogController.getBlogById)

route.get("/:id/edit-article",authMiddleware.validateToken,blogController.getUpdateBlogId)

route.post("/:id/edit-article", blogUpdateValidation, authMiddleware.validateToken,blogController.updateBlog) 

route.get("/author/:id", authMiddleware.validateToken ,blogController.getThisAuthorBlogs)

route.delete("/:id/delete", authMiddleware.validateToken ,blogController.deleteBlog)

module.exports = route