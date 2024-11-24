const config = require('../config/config.js');
const User = require("../models/user.model.js");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const errorHandler = require('../utils/error.js');
const generateUsernameSuggestions = require("../utils/generateUsernameSuggestions.js");
const { nanoid } = require('nanoid');
const crypto = require('crypto');

// const signUp = async (req, res, next) => {
//   const { username, email, password } = req.body;

//   try {
//     const checkEmail = await User.findOne({ email });
//     if (checkEmail) {
//       return res.status(403).json({ message: "This email is already registered" });
//     }
//     const hashedPassword = bcrypt.hashSync(password, 10);
//     const newUser = new User({ username, email, password: hashedPassword });
//     await newUser.save();
//     res.status(201).json({ message: "User created successfully" });
//   } catch (error) {
//     next(error);
//   }
// };

const signUp = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const checkEmail = await User.findOne({ email });
    if (checkEmail) {
      return res.status(403).json({ message: "This email is already registered" });
    }

    const checkUsername = await User.findOne({ username });
    if (checkUsername) {
      const suggestions = await generateUsernameSuggestions(username);
      console.log("Generated suggestions:", suggestions); // Log suggestions
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
      return next(errorHandler(400, "Username/Email and password are required"));
    }

    // Sanitize input: trim spaces and make search case-insensitive
    const sanitizedInput = usernameOrEmail.trim().toLowerCase();

    // Find user by email or username and include the password field
    const validUser = await User.findOne({
      $or: [{ username: sanitizedInput }, { email: sanitizedInput }],
    }).select("+password"); // Explicitly include password field

    if (!validUser) {
      return next(errorHandler(404, "Invalid credentials"));
    }

    // Verify password
    const validPassword = bcrypt.compareSync(password, validUser.password);
    if (!validPassword) {
      return next(errorHandler(401, "Invalid credentials"));
    }

    // Generate JWT token
    const token = jwt.sign({ id: validUser._id }, config.jwt_s, {
      expiresIn: config.jwt_expiration,
    });

    // Cookie expiration
    const cookieExpiration = new Date(Date.now() + Number(config.cookie_expiration));

    // Set cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      expires: cookieExpiration,
    };

    // Exclude password from the response
    const { password: hashedPassword, ...rest } = validUser.toObject();

    // Send token as a cookie and respond with user data
    res
      .cookie("accesstoken", token, cookieOptions)
      .status(200)
      .json(rest);
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

// const google = async (req, res, next) =>{
//   try {
//     const userFromGoogle = await User.findOne({email: req.body.email});
//     if(userFromGoogle){
//       const token = jwt.sign({ id: userFromGoogle._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
//       const expiresAt = new Date(Date.now() + Number(config.cookie_expiration));

//       res.cookie('accesstoken', token, { 
//         httpOnly: true, 
//         secure: process.env.NODE_ENV === 'production',
//         expires: expiresAt
//       })
//       .status(200)
//       .json(userFromGoogle);
//     }else{

//     }
//   } catch (error) {
    
//   }
// };

const google = async (req, res, next) => {
  try {
    const { email, username, profilePhoto } = req.body;

    if (!email || !username) { // Ensure required data is present
      return res.status(400).json({ message: "Invalid Google user data" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Generate a shorter unique ID
      const uniqueId = nanoid(4); // Generate a 6-character ID
      const cleanedUsername = username
        .split(" ")
        .join("")
        .toLowerCase()
        .slice(0, 12); // Limit the name part to 12 characters

      const generatedPassword = crypto.randomBytes(16).toString("hex");
      const hashedPassword = bcrypt.hashSync(generatedPassword, 10);

      user = await User.create({
        username: `${cleanedUsername}${uniqueId}`, // Concatenate cleaned name and ID
        email,
        password: hashedPassword,
        profilePhoto,
      });
    }

    // Generate JWT and set cookie
    const token = jwt.sign({ id: user._id }, config.jwt_s, { expiresIn: config.jwt_expiration });
    res.cookie('accesstoken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      expires: new Date(Date.now() + Number(config.cookie_expiration)),
    });

    // Send user details without password
    const { password, ...safeUser } = user.toObject();
    res.status(200).json(safeUser);
  } catch (error) {
    console.error("Google Auth Error:", error.message || error);
    next(error);
  }
};






module.exports = { signUp, signIn, google};
