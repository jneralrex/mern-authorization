const express = require("express");
const { verifyToken } = require("../utils/authenticateToken");
const {
  updateProfilePhoto,
  signUpload,
  rollBackImageWithErrors,
  deleteAccount,
  getAllUsers,
  getUserById,
  updateUser,
} = require("../controllers/user.controller");

const userRouter = express.Router();

// User-related routes
userRouter.get("/all-users", verifyToken, getAllUsers);
userRouter.get("/individual-user/:id", verifyToken, getUserById);
userRouter.patch("/individual-user/:id", verifyToken, updateUser);
userRouter.post("/sign-upload", verifyToken, signUpload);
userRouter.patch("/update/:id", verifyToken, updateProfilePhoto);
userRouter.post("/rollback", verifyToken, rollBackImageWithErrors);
userRouter.delete("/delete/:id", verifyToken, deleteAccount);

module.exports = userRouter;
