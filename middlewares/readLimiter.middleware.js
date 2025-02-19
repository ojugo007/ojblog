const blogModel = require("../models/blog.model");
const UserModel = require("../models/user.model");

const readLimiter = async (req, res, next) => {
  try {
    const blogId = req.params.id;
    const user = req.user;

    const blog = await blogModel
      .findById(blogId)
      .populate("user_id", "first_name last_name");

    const dailyAccess = user.readersAccess;

    if (dailyAccess.length >= 3) {
      if (dailyAccess.includes(blogId)) {
        return res.status(200).render("singleblog", { blog });
      }
      return res.status(429).render("429");
    }

    dailyAccess.push(blogId);
    await user.save();
    return res.status(200).render("singleblog", { blog });
  } catch (error) {
    return next({ message: error.message });
  }
};

module.exports = { readLimiter };
