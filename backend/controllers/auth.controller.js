const User = require("../models/user.model.js");
const bycrpt = require('bcryptjs');

const signUp = async (req, res, next) => {
    const { username, email, password } = req.body;
    const hashedPassword = bycrpt.hashSync(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    try {
        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        next(error);
    }

};

module.exports = { signUp }