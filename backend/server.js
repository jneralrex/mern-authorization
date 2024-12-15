const express = require("express");
const authRoutes = require("./routes/auth.routes.js");
const userRoutes = require("./routes/user.routes.js"); // Adjusted import
const connectDb = require("./config/connectDb.js");
const cookieParser = require("cookie-parser");
const { config } = require("./config/config.js");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const Message = require("./models/message.schema.model.js");


const app = express();
const port = config.port;

// Connect to Database
connectDb();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Serve static files from the 'client/dist' folder
app.use(express.static(path.join(__dirname, "..", "client", "dist")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/get", userRoutes.getEveryUser);
app.use("/api/get", userRoutes.getSingleUser);
app.use("/api/patch", userRoutes.patchUser);
app.use("/api/profile-picture-upload", userRoutes.uploadRoutes);
app.use("/api/profile-picture-update", userRoutes.profilePicPatchRoute);
app.use("/api/image-management", userRoutes.rollbackRoutes);
app.use("/api/delete-account", userRoutes.deleteMyAccount);

// Serve the index.html file for all routes not matched by API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "dist", "index.html"));
});

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

// Create HTTP server for Socket.IO
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "https://loveconnect-4i23.onrender.com", // Replace with your frontend URL in production
    methods: ["GET", "POST"],
  },
});

// Listen for WebSocket connections
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle incoming messages
  socket.on("send_message", async (data) => {
    try {
      // Save message to the database
      const newMessage = new Message({
        sender: data.senderId,
        content: data.content,
        room: data.room,
      });

      await newMessage.save();

      // Emit the message to all connected clients
      io.emit("receive_message", {
        ...data,
        timestamp: newMessage.timestamp, // Include timestamp if needed
      });
    } catch (err) {
      console.error("Error saving message to database:", err);
    }
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});


// Start the server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
