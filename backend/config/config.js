require("dotenv").config();
const cloudinary = require("cloudinary").v2;

// App configuration object
const config = {
  jwt_s: process.env.JWT_SECRET,
  db_connect: process.env.MONGO,
  port: process.env.PORT,
  jwt_expiration: process.env.JWT_EXPIRATION,
  cookie_expiration: process.env.COOKIE_EXPIRATION_TIME,
  defaultProfilePics: process.env.DEFAULT_PROFILE_PICS,
  refresh_token_expiration: process.env.REFRESH_TOKEN_EXPIRATION, // Refresh token expires in 7 days
  access_token_s: process.env.ACCESS_TOKEN_SECRET,
  refresh_token_s: process.env.REFRESH_TOKEN_SECRET
};

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = { config, cloudinary };

