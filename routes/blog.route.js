const express = require("express")
const blogController = require("../controllers/blog.controller")
const authMiddleware = require("../middlewares/auth.middleware")


const route = express.Router()


route.post("/", authMiddleware.validateToken, blogController.createBlog)
route.get("/", blogController.getAllPublishedBlogs)
route.get("/:id", blogController.getBlogById)
// consider changing to post later on due to html form or use method-override
route.get("/:id/edit-article",authMiddleware.validateToken,blogController.getUpdateBlogId)
route.post("/:id/edit-article",authMiddleware.validateToken,blogController.updateBlog) 
route.get("/author/:id", authMiddleware.validateToken ,blogController.getThisAuthorBlogs)
// route.get("/:id/author", authMiddleware.validateToken ,blogController.getThisAuthorBlogs)
route.delete("/:id/delete", authMiddleware.validateToken ,blogController.deleteBlog)

module.exports = route