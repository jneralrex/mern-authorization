const express = require("express");
const { handleRefreshToken } = require("../controllers/auth.controller.js");

const router = express.Router();

router.post("/refresh-token", handleRefreshToken);

module.exports = router;
