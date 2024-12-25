const { Server } = require("socket.io");
const Message = require("../../models/message.schema.model");
const User = require("../../models/user.model");
const generateRoomId = require("../../utils/roomId"); 

const setupSocketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONT_END_ACCESS_URL,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // User joins a room
    socket.on("join_room", async ({ currentUser, selectedPerson }) => {
      console.log("Current user:", currentUser);
      console.log("Selected person:", selectedPerson);
    
      if (!currentUser || !currentUser._id || !selectedPerson || !selectedPerson._id) {
        return socket.emit("error", "Invalid user data provided.");
      }
    
      try {
        const roomId = generateRoomId(currentUser._id, selectedPerson._id);
        socket.join(roomId);
    
        // Fetch chat history
        const messages = await Message.find({ room: roomId })
          .populate("sender", "username profilePhoto")
          .sort({ timestamp: 1 })
          .limit(50);
    
        socket.emit("chat_history", messages);
      } catch (error) {
        console.error("Error fetching chat history:", error.message);
        socket.emit("error", "Failed to fetch chat history.");
      }
    });
    

    // User sends a message
    socket.on("send_message", async ({ currentUser, selectedPerson, content }) => {
      try {
        // Validate user exists
        const user = await User.findById(currentUser._id);
        if (!user) {
          return socket.emit("error", "User not found.");
        }

        const roomId = generateRoomId(currentUser, selectedPerson);
        const newMessage = new Message({
          sender: currentUser._id,
          content: content,
          room: roomId,
        });

        await newMessage.save();
        console.log("Message saved successfully:", newMessage);

        const populatedMessage = await newMessage.populate("sender", "username profilePhoto");
        io.to(roomId).emit("receive_message", populatedMessage); // Emit message to all users in the room

        console.log("Populated message emitted:", populatedMessage);
      } catch (error) {
        console.error("Error saving message:", error.message);
        socket.emit("error", "Failed to send message.");
      }
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      // Optional: clean up or leave room if necessary
    });
  });

  return io;
};

module.exports = setupSocketIO;
