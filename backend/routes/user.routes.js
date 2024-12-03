const express = require("express");
const { verifyToken } = require("../utils/verifyUser");
const {
  updateProfilePhoto,
  signUpload,
  rollBackImageWithErrors,
  deleteAccount,
} = require("../controllers/user.controller");

// Router for signing requests
const uploadRoutes = express.Router();
uploadRoutes.post("/sign-upload", signUpload); // POST /api/profile-picture-upload/sign-upload

// Router for profile picture updates
const profilePicPatchRoute = express.Router();
profilePicPatchRoute.patch("/update/:id", verifyToken, updateProfilePhoto); // PATCH /api/profile-picture-update/update/:id

// Router for rolling back images
const rollbackRoutes = express.Router();
rollbackRoutes.post("/rollback", rollBackImageWithErrors); // POST /api/profile-picture-upload/rollback

const deleteMyAccount = express.Router();
deleteMyAccount.delete("/delete/:id", verifyToken, deleteAccount); // POST /api/profile-picture-upload/rollback

module.exports = {
  uploadRoutes,
  profilePicPatchRoute,
  rollbackRoutes,
  deleteMyAccount,
};
