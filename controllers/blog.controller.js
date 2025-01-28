const blogModel = require("../models/blog.model");
const UserModel = require("../models/user.model");
const blogService = require("../services/blog.service")

const createBlog = async(req, res)=>{
    const payload = req.body

    if (!payload) {
        // return res.status(400).json({ message: "Missing required fields" });
        return res.status(400).render("create",{ errormessage: "Missing required fields" });
    }
    const newBlog = new blogModel({
        title: payload.title,
        description: payload.description,
        body: payload.body,
        user_id: req.user._id,
        state: payload.state,
        tags: payload.tags
    })

    try{
        const serviceResponse = await blogService.createBlog(newBlog)
        if(req.headers["content-type"] ==="application/json"){
            return res.status(serviceResponse.code).json({
                message: serviceResponse.message,
                data: serviceResponse.data.article,
            });
        }
        // res.status(serviceResponse.code).json({serviceResponse})
        res.status(serviceResponse.code).render("create",{serviceResponse})
    }catch(err){
        console.log(err)
        res.status(400).json({message:err.message || "failed to create blog"})
    }

}

const getAllPublishedBlogs = async(req, res)=>{

    const {title, tags, author, read_time, read_count, page, perPage, sortBy = "created_at", sortOrder = -1 } = req.query
    // Handle page and perPage with fallback defaults
    const currentPage = page ? parseInt(page) : 1; 
    const limit = perPage ? parseInt(perPage) : 20;
    const order = sortOrder === '1' ? 1 : -1;

    const filter = {};

    // Filter by title
    if (title && title.trim()) {
        filter.title = { $regex: new RegExp(title, 'i') };
    }

    // Filter by author
    if (author && author.trim()) {
        let authorNames = author.split(" ");
        let nameQuery = {};
        
        // Handle potential first and last names
        if (authorNames[0]) nameQuery.first_name = { $regex: new RegExp(authorNames[0], 'i') };
        if (authorNames[1]) nameQuery.last_name = { $regex: new RegExp(authorNames[1], 'i') };

        try {
            const authorRecord = await UserModel.findOne(nameQuery);
            
            if (authorRecord) {
                filter.user_id = authorRecord._id;  
                
            } else {
                return res.status(404).json({
                    code: 404,
                    success: false,
                    message: "Author not found",
                    data: [],
                });
            }
        } catch (err) {
            return res.status(500).json({
                message: err.message || "Error occurred while fetching author",
                error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
            });
        }
    }
    // Filter by read_time
    if (read_time && read_time.trim()) {
        filter.read_time = { $gte: Number(read_time) }; 
    }

    // Filter by read_count
    if (read_count && read_count.trim()) {
        filter.read_count = { $gte: Number(read_count) }; 
    }

    // Filter by tags
    if (tags  && tags.trim()) {
        filter.tags = { $regex: new RegExp(tags, 'i') };
    }
    
    try{
        const serviceResponse = await blogService.getAllPublishedBlogs({filter,  page: currentPage, perPage:limit, sortBy, sortOrder:order})


    
        const { docs, totalDocs, totalPages, page, hasPrevPage, hasNextPage, prevPage, nextPage } = serviceResponse.data.blogs;
        // Check if the request is expecting a JSON response (API)
        if (req.headers['content-type'] ==="application/json") {
            // If the request expects JSON, send the response as JSON
            return res.status(serviceResponse.code).json({
                message: serviceResponse.message,
                data: docs, // Send only the blogs
                totalBlogs: totalDocs,
                currentPage: currentPage,
                totalPages: totalPages,
                hasPrevPage: hasPrevPage,
                hasNextPage: hasNextPage,
                prevPage: prevPage,
                nextPage: nextPage,
            });
        }
        

        const query = {};
        if (title) query.title = title;
        if (author) query.author = author;
        if (tags) query.tags = tags;
        if (read_time) query.read_time = read_time;
        if (read_count) query.read_count = read_count;

        res.status(serviceResponse.code).render("blogs",
        {  
            blogs: docs,
            totalblogs: totalDocs,
            currentPage: currentPage,
            totalPages: totalPages,
            hasPrevPage: hasPrevPage, 
            hasNextPage: hasNextPage, 
            prevPage: prevPage, 
            nextPage: nextPage,
            user: res.locals.user,
            filter: query
          
        })
    
    }catch(err){
        console.log(err)
        res.status(500).json({message: err.message  || "Unable to retrieve all post", error: process.env.NODE_ENV === 'development' ? err.stack : undefined})
    }

}

const getThisAuthorBlogs = async(req, res)=>{
    const user_id = req.params.id
    const loggedInUser = req.user._id
    const { state, page = 1, perPage = 15} = req.query
    
    try{
        const serviceResponse = await blogService.getThisAuthorBlogs(user_id, loggedInUser, state, page, perPage)

        console.log(serviceResponse.data.blogs)

        if (req.headers['content-type'] ==="application/json") {
            // If the request expects JSON, send the response as JSON
            console.log(serviceResponse.message)

            return res.status(serviceResponse.code).json({
                message: serviceResponse.message,
                data: serviceResponse.data.blogs, // Send only the blogs
                user_id: user_id,
                loggedInUser: loggedInUser,
                state: state,
                page: page,
                perPage: perPage,
            });
        }
        res.status(serviceResponse.code).render("dashboard", {blog:serviceResponse.data.blogs, user : req.user, authorId : user_id})

    }catch(err){
        console.log(err)
        res.status(500).json({message: err.message  || "Unable to retrieve all post", error: process.env.NODE_ENV === 'development' ? err.stack : undefined})
    }

}

const getBlogById = async(req, res)=>{
    const blogId = req.params.id
    if (!blogId) {
        return res.status(400).json({ message: "blog not found" });
    }
    try{
        const serviceResponse = await blogService.getBlogById(blogId)

        if (!serviceResponse.data) {
            return res.status(404).json({ message: "Blog not found" });
        }

        if (req.headers['content-type'] ==="application/json") {
            // If the request expects JSON, send the response as JSON
            console.log(serviceResponse.message)

            return res.status(serviceResponse.code).json({
                message: serviceResponse.message,
                data: serviceResponse.data, // Send only the blogs
                // user_id: res.locals.user._id,
            
            });
        }
        res.status(serviceResponse.code).render("singleblog",{blog: serviceResponse.data.blog, user: res.locals.user})
    }catch(err){
        console.log(err)
        res.status(500).json({message: err.message  || "Unable to retrieve this post"})
    
    }
}

const getUpdateBlogId = async(req, res)=>{
    const blogId = req.params.id;
    try{
        const serviceResponse = await blogService.getUpdateBlogId(blogId)
        res.status(serviceResponse.code).render("updateblog", {blog: serviceResponse.data.blog})
    }catch(err){
        console.log(err)
        res.status(500).json({
            message: "unable to find blog"
        })
    }

}
const updateBlog = async(req, res)=>{
    const payload = req.body;
    const blogId = req.params.id
    const loggedInUser = req.user._id;

    if (!payload) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    if (!blogId) {
        return res.status(400).json({ message: "blog not found" });
    }
    try{
        const serviceResponse = await blogService.updateBlog(blogId, payload, loggedInUser);
        res.status(serviceResponse.code).json(serviceResponse)
    
    }catch(err){
        console.log(err)
        res.status(500).json({message: err.message  || "Unable to update this post" })
    }

}

const deleteBlog = async(req, res)=>{
    const loggedInUser = req.user._id;
    const blogId = req.params.id;

    const serviceResponse = await blogService.deleteBlog(blogId,loggedInUser)

    res.status(serviceResponse.code).json(serviceResponse)

}

module.exports = {
    createBlog, 
    getAllPublishedBlogs,
    getThisAuthorBlogs, 
    getBlogById,
    getUpdateBlogId, 
    updateBlog,
    deleteBlog
}
