const jwt = require("jsonwebtoken");
const { config } = require("../config/config");

// Function to generate an access token
const generateAccessToken = (user) => {
  try {
    const payload = {
      _id: user._id,
      role: user.role, // Add any other necessary fields
    };

    // Use config for access token expiration time
    const accessToken = jwt.sign(payload, config.access_token_s, {
      expiresIn: config.cookie_expiration,
    });

    return accessToken;
  } catch (error) {
    // Log the error and rethrow it for further handling
    console.error("Error generating access token: ", error);
    throw new Error("Failed to generate access token");
  }
};

module.exports = {
  generateAccessToken,
};
