const jwt = require("jsonwebtoken")
const UserModel = require("../models/user.model")
require("dotenv").config()


const validateToken = async (req, res, next) => {
  let bearerToken = req.cookies.token;

  if (!bearerToken) {
    return res.status(401).json({message : "Unauthorized"})
      
  }


  try {
    const decodeToken = jwt.verify(
      bearerToken,
      process.env.JWT_SECRET
    );


    const user = await UserModel.findOne({ email: decodeToken.email });
    if (!user) {
      return res.status(401).json({message : "Unauthorized"})
    }

    req.user = user;
    
    next();

  } catch (err) {
    console.log(err);

    if (err.name === "JsonWebTokenError") {
      return res.status(403).json({message: "Invalid token signature" });
    }

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
      
    }
    
  }
};


module.exports = { validateToken }