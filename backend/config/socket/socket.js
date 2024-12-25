const { Server } = require("socket.io");
const Message = require("../../models/message.schema.model");
const User = require("../../models/user.model");
const generateRoomId = require("../../utils/roomId");
const messageValidationSchema = require("../../models/messageValidationSchema");
const uploadMedia = require("../../utils/file/upload");

const setupSocketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONT_END_ACCESS_URL,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join_room", async ({ currentUser, selectedPerson }) => {
      console.log("Current user:", currentUser);
      console.log("Selected person:", selectedPerson);

      if (!currentUser || !currentUser._id || !selectedPerson || !selectedPerson._id) {
        return socket.emit("error", "Invalid user data provided.");
      }

      try {
        const roomId = generateRoomId(currentUser, selectedPerson);
        socket.join(roomId);
        console.log(`${currentUser.username} joined room: ${roomId}`);

        const messages = await Message.find({ room: roomId })
          .populate("sender", "username profilePhoto")
          .sort({ timestamp: 1 })
          .limit(50);

        console.log("Messages fetched from DB:", messages);
        socket.emit("chat_history", messages);
      } catch (error) {
        console.error("Error fetching chat history:", error.message);
        socket.emit("error", "Failed to fetch chat history.");
      }
    });

    socket.on("send_message", async (data) => {
      const { error, value } = messageValidationSchema.validate(data);
      if (error) {
        return socket.emit("error", `Validation error: ${error.message}`);
      }

      const { currentUser, selectedPerson, content, mediaFile, mediaType } = value;

      try {
        const user = await User.findById(currentUser._id);
        if (!user) {
          return socket.emit("error", "User not found.");
        }

        const roomId = generateRoomId(currentUser, selectedPerson);

        let mediaUrl = null;
        if (mediaFile) {
          const upload = await uploadMedia.single('mediaFile');
          mediaUrl = upload.path;
        }

        const newMessage = new Message({
          sender: currentUser._id,
          content,
          room: roomId,
          mediaUrl,
          mediaType,
        });

        await newMessage.save();

        const populatedMessage = await newMessage.populate("sender", "username profilePhoto");

        io.to(roomId).emit("receive_message", populatedMessage);
        console.log("Message sent:", populatedMessage);
      } catch (err) {
        console.error("Error sending message:", err.message);
        socket.emit("error", "Failed to send message.");
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

module.exports = setupSocketIO;