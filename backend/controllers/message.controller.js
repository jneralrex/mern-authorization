const Message = require("../models/message.schema.model"); // Mongoose schema for messages
const User = require("../models/user.model"); // Mongoose schema for users
const { generateRoomId } = require("../utils/roomId");

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // User joins a room
  socket.on("join_room", async ({ currentUser, selectedPerson }) => {
    try {
      const roomId = generateRoomId(currentUser, selectedPerson);

      socket.join(roomId);
      console.log(`${currentUser.username} joined room: ${roomId}`);

      // Fetch chat history for the room
      const messages = await Message.find({ room: roomId })
        .populate("sender", "username profilePhoto")
        .sort({ timestamp: 1 });

      console.log("Messages fetched from DB:", messages);
      socket.emit("chat_history", messages);
    } catch (error) {
      console.error("Error fetching chat history:", error.message);
    }
  });

  // User sends a message
  socket.on("send_message", async ({ currentUser, selectedPerson, content }) => {
    try {
      const roomId = generateRoomId(currentUser, selectedPerson);

      const newMessage = new Message({
        sender: currentUser._id,
        content: content,
        room: roomId,
      });

      await newMessage.save();
      console.log("Message saved successfully:", newMessage);

      const populatedMessage = await newMessage.populate("sender", "username profilePhoto");
      io.to(roomId).emit("receive_message", populatedMessage);

      console.log("Populated message emitted:", populatedMessage);
    } catch (error) {
      console.error("Error saving message:", error.message);
    }
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
