const User = require("../models/user.model.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const errorHandler = require("../utils/error.js");
const generateUsernameSuggestions = require("../utils/generateUsernameSuggestions.js");
const { nanoid } = require("nanoid");
const crypto = require("crypto");
const { config } = require("../config/config.js");

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

  try {
    if (!usernameOrEmail || !password) {
      return next(
        errorHandler(400, "Username/Email and password are required")
      );
    }

    const sanitizedInput = usernameOrEmail.trim().toLowerCase();

    const validUser = await User.findOne({
      $or: [{ username: sanitizedInput }, { email: sanitizedInput }],
    }).select("+password");

    if (!validUser) {
      return next(errorHandler(404, "Invalid credentials"));
    }

    const validPassword = bcrypt.compareSync(password, validUser.password);
    if (!validPassword) {
      return next(errorHandler(401, "Invalid credentials"));
    }

    const token = jwt.sign({ id: validUser._id }, config.jwt_s, {
      expiresIn: config.jwt_expiration,
    });

    const cookieExpiration = new Date(
      Date.now() + Number(config.cookie_expiration)
    );

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      expires: cookieExpiration,
    };

    const { password: hashedPassword, ...rest } = validUser.toObject();

    res
      .cookie("accesstoken", token, cookieOptions)
      .status(200)
      .json({ token, ...rest });
  } catch (error) {
    if (
      error.code === "ENOTFOUND" ||
      (error.message && error.message.includes("ECONNRESET"))
    ) {
      return res.status(500).json({
        success: false,
        message: "Check your internet connection and try again",
      });
    }
    next(error);
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
  res.clearCookie("accesstoken").status(200).json("signout success");
};

module.exports = { signUp, signIn, google, signout };
