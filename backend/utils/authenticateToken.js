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
  const token =
    req.cookies.accesstoken || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "You need to log in" });
  }

  try {
    const user = await verifyJwtToken(token);  // Use await to handle the promise
    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired, refresh needed" });
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { verifyToken };
