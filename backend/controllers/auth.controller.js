const User = require("../models/user.model.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const errorHandler = require("../utils/error.js");
const generateUsernameSuggestions = require("../utils/generateUsernameSuggestions.js");
const { nanoid } = require("nanoid");
const crypto = require("crypto");
const { config } = require("../config/config.js");
const { encryptToken, decryptToken } = require("../utils/tokenEncryption.js");
const { generateAccessToken } = require("../utils/generateAccessToken.js");
const logger = require("../utils/logger.js");
const { generateRefreshToken } = require("../utils/generateRefreshToken.js");

const signUp = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const checkEmail = await User.findOne({ email });
    if (checkEmail) {
      return res
        .status(403)
        .json({ message: "This email is already registered" });
    }

    const checkUsername = await User.findOne({ username });
    if (checkUsername) {
      const suggestions = await generateUsernameSuggestions(username);
      return res.status(409).json({
        message: "This username is already taken",
        suggestions: suggestions,
      });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    next(error);
  }
};

const signIn = async (req, res, next) => {
  const { usernameOrEmail, password } = req.body;

  // Log the incoming request
  logger.info(`SignIn attempt for: ${usernameOrEmail}`);

  try {
    if (!usernameOrEmail || !password) {
      logger.warn(`Missing credentials for: ${usernameOrEmail}`);
      return next(errorHandler(400, "Username/Email and password are required"));
    }

    const sanitizedInput = usernameOrEmail.trim().toLowerCase();
    const validUser = await User.findOne({
      $or: [{ username: sanitizedInput }, { email: sanitizedInput }],
    }).select("+password");

    if (!validUser) {
      logger.warn(`Failed login attempt: ${usernameOrEmail}`);
      return next(errorHandler(404, "Invalid credentials"));
    }

    const validPassword = await bcrypt.compare(password, validUser.password);
    if (!validPassword) {
      logger.warn(`Invalid password attempt for: ${usernameOrEmail}`);
      return next(errorHandler(401, "Invalid credentials"));
    }

    // Log successful login
    logger.info(`Successful login for: ${validUser.username}`);

    // Generate access token
    const accessToken = jwt.sign({ id: validUser._id }, config.jwt_s, {
      expiresIn: config.jwt_expiration,
    });

    // Generate and encrypt refresh token
    const refreshToken = jwt.sign({ id: validUser._id }, config.jwt_s, {
      expiresIn: config.refresh_token_expiration,
    });

    // Encrypt and save refresh token to the database
    const encryptedRefreshToken = encryptToken(refreshToken);
    validUser.refreshToken = encryptedRefreshToken;
    await validUser.save();

    // Return the user data excluding password and refreshToken
    const { password: _, refreshToken: __, ...userData } = validUser.toObject();

    const cookieExpiration = Number(config.cookie_expiration);
    const refreshTokenExpiration = Number(config.refresh_token_expiration);

    if (isNaN(cookieExpiration) || isNaN(refreshTokenExpiration)) {
      logger.error('Invalid cookie or refresh token expiration time');
      return next(errorHandler(500, "Invalid cookie expiration or refresh token expiration"));
    }

    res
      .cookie("accesstoken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        expires: new Date(Date.now() + cookieExpiration),
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        expires: new Date(Date.now() + refreshTokenExpiration),
      })
      .status(200)
      .json({
        token: accessToken,
        user: userData,
      });

    logger.info(`Tokens generated and sent for: ${validUser.username}`);

  } catch (error) {
    logger.error(`Error during signIn: ${error.message}`);
    next(error); // Pass error to the global error handler
  }
};

const handleRefreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Decrypt and verify the stored token
    const user = await User.findOne({ refreshToken: encryptToken(refreshToken) });

    if (!user) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const storedToken = decryptToken(user.refreshToken);
    if (storedToken !== refreshToken) {
      return res.status(403).json({ message: "Token mismatch" });
    }

    // Proceed to generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Encrypt and store the new refresh token
    user.refreshToken = encryptToken(newRefreshToken);
    await user.save();

    res.cookie("refreshToken", newRefreshToken, { httpOnly: true, secure: true });
    return res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Error handling refresh token:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const google = async (req, res, next) => {
  try {
    const { email, username, profilePhoto } = req.body;

    if (!email || !username) {
      return res.status(400).json({ message: "Invalid Google user data" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const uniqueId = nanoid(4);
      const cleanedUsername = username
        .split(" ")
        .join("")
        .toLowerCase()
        .slice(0, 12);
      const generatedPassword = crypto.randomBytes(16).toString("hex");
      const hashedPassword = bcrypt.hashSync(generatedPassword, 10);

      user = await User.create({
        username: `${cleanedUsername}${uniqueId}`,
        email,
        password: hashedPassword,
        profilePhoto,
      });
    }

    const token = jwt.sign({ id: user._id }, config.jwt_s, {
      expiresIn: config.jwt_expiration,
    });

    res.cookie("accesstoken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      expires: new Date(Date.now() + Number(config.cookie_expiration)),
    });

    const { password, ...safeUser } = user.toObject();
    res.status(200).json({ token, ...safeUser });
  } catch (error) {
    console.error("Google Auth Error:", error.message || error);
    next(error);
  }
};

const signout = (req, res) => {
  res
    .clearCookie("accesstoken")
    .clearCookie("refreshToken")
    .status(200)
    .json("Signout success");
};


module.exports = { signUp, signIn, google, signout, handleRefreshToken};
