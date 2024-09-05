const express = require('express');
const { signUp } = require('../controllers/auth.controller.js');
const router = express.Router();

router.post('/signup', signUp)

module.exports = router;
