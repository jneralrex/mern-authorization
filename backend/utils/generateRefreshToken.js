const jwt = require("jsonwebtoken");
const { config } = require("../config/config");

// Function to generate a refresh token
const generateRefreshToken = (user) => {
  try {
    const payload = {
      _id: user._id,
      role: user.role, // Add any other necessary fields
    };

    // Use config for refresh token expiration to ensure consistency
    const refreshToken = jwt.sign(payload, config.refresh_token_s, {
      expiresIn: config.refresh_token_expiration,
    });

    return refreshToken;
  } catch (error) {
    // Log the error if needed or handle it accordingly
    console.error("Error generating refresh token: ", error);
    throw new Error("Failed to generate refresh token");
  }
};

module.exports = {
  generateRefreshToken,
};
