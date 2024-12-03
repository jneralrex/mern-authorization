const mongoose = require("mongoose");
const { config } = require("../config/config");

// Password validation regex (at least 8 characters, one uppercase, one number, one special character)
const passwordValidator =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{}|;:'",.<>?/\\`~\-])[A-Za-z\d!@#$%^&*()_+[\]{}|;:'",.<>?/\\`~\-]{8,}$/;

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address."],
      lowercase: true,
    },
    role: {
      type: String,
      enum: ["user", "guide", "lead-guide", "admin"],
      default: "user",
    },
    profilePhoto: {
      type: String, // Cloudinary URL for the profile photo
      default: config.defaultProfilePics, // Default profile photo
    },
    profilePhotoPublicId: {
      type: String, // Cloudinary public ID for the profile photo
    },
    images: [
      {
        url: String, // Array of image URLs
        publicId: String, // Cloudinary public IDs
      },
    ],
    coverImage: {
      url: String, // Cover image URL
      publicId: String, // Cloudinary public ID
    },
    password: {
      type: String,
      required: true,
      select: false,
      validate: {
        validator: function (v) {
          return passwordValidator.test(v);
        },
        message:
          "Password must be at least 8 characters, contain a special character, an uppercase letter, and a number.",
      },
    },
  },
  { timestamps: true }
);

// userSchema.virtual('fullName').get(function() {
//     return `${this.firstName} ${this.lastName}`;
// });

// Indexes for optimized queries
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

const User = mongoose.model("User", userSchema);
module.exports = User;
