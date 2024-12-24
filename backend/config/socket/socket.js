const { Server } = require("socket.io");
const Message = require("../../models/message.schema.model");

const setupSocketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONT_END_BASE_URL,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Join room
    socket.on("join_room", async (room) => {
      if (room) {
        socket.join(room);
        console.log(`User ${socket.id} joined room: ${room}`);

        // Fetch chat history for the room
        const chatHistory = await Message.find({ room }).sort({ timestamp: 1 }); // You can sort by timestamp
        socket.emit("chat_history", chatHistory); // Send chat history to the user who joined the room
      }
    });

    // Handle incoming messages
    socket.on("send_message", async (data) => {
      const { senderId, content, room } = data;

      if (!socket.rooms.has(room)) {
        return socket.emit("error", "You are not part of this room.");
      }
      if (!senderId || !content || !room) {
        return socket.emit("error", "Invalid message data.");
      }

      try {
        const newMessage = new Message({ sender: senderId, content, room });
        await newMessage.save();
        io.to(room).emit("receive_message", {
          ...data,
          timestamp: newMessage.timestamp,
        });
      } catch (err) {
        console.error("Error saving message to database:", err);
        socket.emit("error", "Failed to send message.");
      }
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

module.exports = setupSocketIO;
