const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { cloudinary } = require("../../config/config");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "chat_media", // Customize folder name
    resource_type: "auto", // Automatically handle image, video, etc.
  },
});

const uploadMedia = multer({ storage });

module.exports = uploadMedia;
