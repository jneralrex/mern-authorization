const express = require("express");
const authRoutes = require("./routes/auth.routes.js");
const userRoutes = require("./routes/user.routes.js"); // Adjusted import
const connectDb = require("./config/connectDb.js");
const cookieParser = require("cookie-parser");
const { config } = require("./config/config.js");
const path = require("path");
const http = require("http");
const setupSocketIO = require("./config/socket/socket.js");
const router = require('./routes/refreshToken.js');
const authRateLimiter = require("./utils/sensitiveAttempt.limiiter.js"); // Rate limiter for too many login attempts to avaoid brute force attack
// const loginAttemptDelay = require("./utils/failedLoginAttempt.js"); Delay login attempt in case of several trial to avaoid brute force
const cors = require("cors"); //incase backend and frontend url changes, for now they are hosted on same url

const app = express();
const port = config.port;

// Connect to Database
connectDb();


app.use(
  cors({
    origin: process.env.FRONT_END_BASE_URL,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true, // Allow sending cookies
  })
); //incase backend and frontend url changes, for now they are hosted on same url, cors should be reconfigured accordingly


app.use(express.json());
app.use(cookieParser());

// Apply the login attempt delay middleware specifically for the sign-in route
// app.use("/api/auth/sign-in", loginAttemptDelay);

// End point for refreshing token
app.use("/api/auth/refresh-token", router);

// Apply rate limiter to the sign-in and signup route
app.use("/api/auth/sign-in", authRateLimiter);
app.use("/api/auth/signup", authRateLimiter);

// Serve static files from the 'client/dist' folder
app.use(express.static(path.join(__dirname, "..", "client", "dist")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// Serve the index.html file for all routes not matched by API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "dist", "index.html"));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Error caught by errorHandler:", err);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  // const errorMessage =
  //   err.code === "ENOTFOUND" ||
  //   (err.message && err.message.includes("ECONNRESET"))
  //     ? "Check your internet connection and try again"
  //     : err.message || "Internal Server Error";
  const errorMessage = err.message || "Internal Server Error";

  // More specific handling of known error types (e.g., Database, Validation)
  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: errorMessage });
  }

  res.status(statusCode).json({
    success: false,
    message: errorMessage,
  });
});

// Create HTTP server for Socket.IO
const server = http.createServer(app);

// Initialize Socket.IO
setupSocketIO(server);

// Start the server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
