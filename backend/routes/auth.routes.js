const express = require('express');
const { signUp, signIn, google } = require('../controllers/auth.controller.js');
const router = express.Router();

router.post('/signup', signUp)
router.post('/sign-in', signIn)
router.post('/google', google)


module.exports = router;
