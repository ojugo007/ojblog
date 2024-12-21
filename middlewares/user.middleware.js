// middleware/user.js

const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");

const attachUserToLocals = async (req, res, next) => {
  let bearerToken = req.cookies.token;

  if (bearerToken) {
    try {
      const decodedToken = jwt.verify(bearerToken, process.env.JWT_SECRET);
      const user = await UserModel.findOne({ email: decodedToken.email });
      
      if (user) {
        res.locals.user = user;
      }
    } catch (err) {
      console.log(err);
    }
  }
  next();
};

module.exports = {attachUserToLocals};
