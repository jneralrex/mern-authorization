const { config } = require("../config/config");
const jwt = require("jsonwebtoken");

// Create a promisified version of jwt.verify
const verifyJwtToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.jwt_s, (err, user) => {
      if (err) reject(err);
      else resolve(user);
    });
  });
};

const verifyToken = async (req, res, next) => {
  try {
    const token =
      req.cookies.accesstoken || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "You need to log in" });
    }

    // Use the promisified version of jwt.verify
    const user = await verifyJwtToken(token);

    // Attach the decoded user information to the request object
    req.user = user;

    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

module.exports = { verifyToken };
