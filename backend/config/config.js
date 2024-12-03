require("dotenv").config();
const cloudinary = require("cloudinary").v2;

// App configuration object
const config = {
  jwt_s: process.env.JWT_SECRET || "generatenewtoken",
  db_connect: process.env.MONGO,
  port: process.env.PORT || 5000,
  jwt_expiration: process.env.JWT_EXPIRATION || "1h",
  cookie_expiration:
    process.env.COOKIE_EXPIRATION_TIME || 7 * 24 * 60 * 60 * 1000,
  defaultProfilePics: process.env.DEFAULT_PROFILE_PICS,
};

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = { config, cloudinary };

