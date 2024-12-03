const express = require("express");
const authRoutes = require("./routes/auth.routes.js");
const userRoutes = require("./routes/user.routes.js"); // Adjusted import
const connectDb = require("./config/connectDb.js");
const cookieParser = require("cookie-parser");
const { config } = require("./config/config.js");
const path = require("path");

const app = express();
const port = config.port;

// Connect to Database
connectDb();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Static Files Middleware
app.use(express.static(path.join(__dirname, 'client', 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile-picture-upload", userRoutes.uploadRoutes); // For signing Cloudinary uploads
app.use("/api/profile-picture-update", userRoutes.profilePicPatchRoute); // For profile picture updates
app.use("/api/image-management", userRoutes.rollbackRoutes); // For managing bad uploads
app.use("/api/delete-account", userRoutes.deleteMyAccount); // For deleting accounts

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Error caught by errorHandler:", err);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const errorMessage =
    err.code === "ENOTFOUND" ||
    (err.message && err.message.includes("ECONNRESET"))
      ? "Check your internet connection and try again"
      : err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message: errorMessage,
  });
});

// Start Server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
