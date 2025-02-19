const blogModel = require("../models/blog.model");
const UserModel = require("../models/user.model");
const cloudinary = require("../integrations/cloudinary")
const fs = require("fs")

const calculateReadCount = async (blogId) => {
  try {
    const blog = await blogModel.findOne({ _id: blogId });
    if(!blog) {
      throw new Error("blog not found");
    }

    blog.read_count += 1;
    await blog.save();
    return blog.read_count;

  } catch (err) {
    console.log(err);
    throw new Error("an error occurred while update read_count");
  }
};

const createBlog = async ({ title, description, body, user_id, state, tags, image_url }) => {

  try{
    if (image_url) {
      const response = await cloudinary.uploader.upload(image_url.path);
      console.log("cloudinary upload response", response)
      // Delete the file from the server after uploading to Cloudinary
      fs.unlink(image_url.path, (err) => {
        if (err) {
          console.log('Error deleting file: ', err);
        } else {
          console.log('File deleted successfully');
        }
      });

      image_url = response.secure_url;  
      console.log("image_url", image_url)
    }

    const article = await blogModel.create({
      title,
      description,
      body,
      user_id: user_id,
      state,
      tags,
      image_url
    });
    
    return {
      code: 201,
      success: true,
      data: {
        article,
      },
      message: "Article created successfully",
    };

  }catch(error){
    console.log(error.message)
    return {
      code: 500,
      success: false,
      data: null,
      message: "unable to submit article",
    };

  }
};

const getAllPublishedBlogs = async ({
  filter,
  page = 1,
  perPage = 20,
  sortBy = "created_at", 
  sortOrder = -1,
}) => {
  const query = { state: "published" }

  if (filter.title) {
    query.title = { $regex: filter.title.$regex};
  }
  if (filter.tags) {
    query.tags = { $regex: filter.tags.$regex};
  }


  if (filter.user_id) {
    query.user_id = filter.user_id; 
  }
  
  if (filter.read_time) {
    query.read_time = { $gte: filter.read_time.$gte };
  }

  if (filter.read_count) {
    query.read_count = { $gte: filter.read_count.$gte }; 
  }



  // sorting

  const sortOptions = {};

  if (sortBy === "read_time") {

    sortOptions.read_time = sortOrder;

  } else if (sortBy === "read_count") {

    sortOptions.read_count = sortOrder;

  } else if (sortBy === "created_at") {
    sortOptions.created_at = sortOrder; 
  }

  
  const blogs = await blogModel.paginate( query, {
    page,
    limit: perPage,
    sort : sortOptions,
    populate: { path: 'user_id', select: 'first_name last_name' }
  });

  return {
    code: 200,
    success: true,
    data: {
      blogs,
    },
    message: "Published blogs retrieved successfully",
  };
};

// retrieves both published and drafted blogs(protected route for author)
const getThisAuthorBlogs = async (user_id, loggedInUser, state, page = 1, perPage = 15) => {
  if (loggedInUser.toString() !== user_id) {
    return {
      code: 403,
      success: false,
      data: null,
      message: "Unauthorized access to another authors blog",
    };
  }
  const query = {user_id}
  if(state){
    query.state = state
  }
  const blogs = await blogModel.paginate(query, {page, limit: perPage});

  return {
    code: 200,
    success: true,
    data: {
      blogs,
    },
    message: "authors blogs retrieved successfully",
  };
};

const getBlogById = async (blogId) => {
  const blog = await blogModel.findById(blogId).populate("user_id", "first_name last_name");

  if (!blog) {
    return {
      code: 404,
      success: false,
      data: null,
      message: "blog not found",
    };
  }

  blog.read_count = await calculateReadCount(blogId);

  await blog.save();

  return {
    code: 200,
    success: true,
    data: {
      blog,
    },
    message: "Blog retrieved successfully",
  };
};

const getUpdateBlogId = async(blogId)=>{
  const blog = await blogModel.findById(blogId)
  if(!blog){
    return{
      code:404,
      success:false,
      data: null,
      message: "blog not found"
    }
  }
  return {
    code: 200,
    success: true,
    data: {
      blog,
    },
    message: "Blog retrieved successfully",
  };

}

const updateBlog = async (
  blogId,
  { title, description, body, updated_at, state, tags },
    loggedInUser
) => {
  const blog = await blogModel.findById(blogId);

  if (loggedInUser.toString() !== blog.user_id.toString()) {
    return {
      code: 403,
      success: false,
      data: null,
      message: "You are not authorized to edit this post",
    };
  }
  if (!blog) {
    return {
      code: 404,
      success: false,
      data: null,
      message: "blog not found",
    };
  }

  blog.title = title || blog.title;
  blog.description = description || blog.description;
  blog.body = body || blog.body;
  blog.updated_at = updated_at || Date.now();
  blog.state = state || blog.state;
  blog.tags = tags || blog.tags;

  await blog.save();
  return {
    code: 200,
    success: true,
    data: {
      blog,
    },
    message: "Blog updated successfully",
  };
};

const deleteBlog = async (blogId, loggedInUser) => {
  if (!blogId) {
    return {
      code: 404,
      success: false,
      data: null,
      message: "bad request, Blog id is required",
    };
  }
  console.log(blogId);
  const blog = await blogModel.findById(blogId);
  if (!blog) {
    return {
      code: 404,
      success: false,
      data: null,
      message: "Blog not found",
    };
  }

  if (loggedInUser.toString() !== blog.user_id.toString()) {
    return {
      code: 403,
      success: false,
      data: null,
      message: "You are not authorized to delete this post",
    };
  }
  await blogModel.deleteOne(blog);
  return {
    code: 200,
    success: true,
    data: null,
    message: "Blog deleted successfully",
  };
};

module.exports = {
  createBlog,
  getAllPublishedBlogs,
  getThisAuthorBlogs,
  getBlogById,
  getUpdateBlogId,
  updateBlog,
  deleteBlog,
};
