const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: false }, // Content is optional for media-only messages
    room: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    mediaUrl: { type: String }, // URL for media file (e.g., image, video)
    mediaType: { type: String, enum: ["image", "video", "audio", "file"], required: false }, // Type of media
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);