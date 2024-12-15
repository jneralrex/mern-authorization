const { cloudinary } = require("../config/config");
const User = require("../models/user.model");
const asyncHandler = require("express-async-handler");


// GET /api/users?page=1&limit=10
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  // Ensure that limit is a valid number and within range
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  if (isNaN(pageNumber) || isNaN(limitNumber)) {
    return res.status(400).json({ success: false, error: "Invalid pagination parameters" });
  }

  // Fetch users with pagination
  const users = await User.find()
    .skip((pageNumber - 1) * limitNumber) // Skip the previous pages
    .limit(limitNumber) // Limit the number of users per page
    .select("-password"); // Optionally exclude sensitive fields like password

  // Count total users for pagination
  const totalUsers = await User.countDocuments();

  res.status(200).json({
    success: true,
    users,
    totalUsers,
    totalPages: Math.ceil(totalUsers / limitNumber),
    currentPage: pageNumber,
  });
});

// GET /api/users/:id
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }

  res.status(200).json({ success: true, user });
});

// PUT or PATCH /api/users/:id
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Make sure required fields are provided
  if (!updateData) {
    return res.status(400).json({ success: false, error: "No data provided for update" });
  }

  const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });

  if (!updatedUser) {
    return res.status(404).json({ success: false, error: "User not found" });
  }

  res.status(200).json({ success: true, user: updatedUser });
});

// Utility Functions
const uploadToCloudinary = async (file, folder, tags = []) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
      transformation: { width: 500, height: 500, crop: "limit" },
      tags,
    });
    return { url: result.secure_url, publicId: result.public_id };
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw new Error("Cloudinary upload failed");
  }
};

const deleteFromCloudinary = async (publicId) => {
  if (!publicId) {
    console.warn("Public ID is missing for deletion");
    return false;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result !== "ok") {
      throw new Error(`Failed to delete image with public ID: ${publicId}`);
    }
    return true;
  } catch (error) {
    console.error(`Failed to delete ${publicId}:`, error);
    return false;
  }
};

const updateUserField = async (userId, updateData) => {
  return await User.findByIdAndUpdate(userId, updateData, { new: true });
};

// POST /api/profile-picture-upload/sign-upload
const signUpload = asyncHandler((req, res) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: "profile_pictures" },
    process.env.CLOUDINARY_API_SECRET
  );

  if (!signature) {
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to generate Cloudinary signature",
      });
    return;
  }

  res.status(200).json({
    success: true,
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  });
});

// PATCH /api/profile-picture-update/update/:id
const updateProfilePhoto = asyncHandler(async (req, res) => {
  const { profilePhoto, publicId } = req.body;
  const { id: userId } = req.params;

  if (!userId || !profilePhoto || !publicId) {
    res.status(400).json({ success: false, error: "Invalid input data" });
    return;
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json({ success: false, error: "User not found" });
    return;
  }

  if (user.profilePhotoPublicId) {
    const isDeleted = await deleteFromCloudinary(user.profilePhotoPublicId);
    if (!isDeleted) {
      console.warn(`Failed to delete old profile photo for user ${userId}`);
    }
  }

  user.profilePhoto = profilePhoto;
  user.profilePhotoPublicId = publicId;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile photo updated successfully",
    profilePhoto: user.profilePhoto,
  });
});

// DELETE /api/users/:id
const deleteAccount = asyncHandler(async (req, res) => {
  try {
    // Find the user by ID
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const deletionPromises = [];

    // If the user has a profile photo, add deletion to promises
    if (user.profilePhotoPublicId) {
      deletionPromises.push(deleteFromCloudinary(user.profilePhotoPublicId));
    } else {
      console.warn(
        `Missing publicId for profile photo of user ${req.params.id}`
      );
    }

    // If the user has images, add deletion to promises for each image
    if (user.images?.length) {
      user.images.forEach((image) => {
        if (image.publicId) {
          deletionPromises.push(deleteFromCloudinary(image.publicId));
        } else {
          console.warn(`Missing publicId for image of user ${req.params.id}`);
        }
      });
    }

    // Await all Cloudinary deletion promises
    const deletionResults = await Promise.allSettled(deletionPromises);

    // Log the results of Cloudinary deletions (successes and failures)
    deletionResults.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(`Failed to delete image ${index}:`, result.reason);
      } else {
        console.log(`Image ${index} deleted successfully`);
      }
    });

    // Delete the user from the database
    await User.findByIdAndDelete(req.params.id);

    // Send response
    res.status(200).clearCookie("accesstoken").json({
      success: true,
      message: "Account, Cookies and associated images successfully deleted",
    });
  } catch (error) {
    console.error("Error during account deletion:", error);
    res
      .status(500)
      .json({ success: false, error: "Server error during account deletion" });
  }
});

// POST /api/images/upload
const uploadImages = asyncHandler(async (req, res) => {
  const { files } = req.body;
  if (!files || !files.length) {
    res.status(400).json({ success: false, error: "No files uploaded" });
    return;
  }

  try {
    const uploadedImages = await Promise.all(
      files.map((file) =>
        uploadToCloudinary(file, "user_images", [req.user.id])
      )
    );

    const user = await updateUserField(req.user.id, {
      $push: { images: { $each: uploadedImages } },
    });

    res.status(200).json({
      success: true,
      message: "Images uploaded successfully",
      images: user.images,
    });
  } catch (error) {
    console.error("Failed to upload images:", error);
    res.status(500).json({ success: false, error: "Failed to upload images" });
  }
});

// POST /api/images/cover
const uploadCoverImage = asyncHandler(async (req, res) => {
  const { file } = req.body;
  if (!file) {
    res.status(400).json({ success: false, error: "No file uploaded" });
    return;
  }

  try {
    const coverImage = await uploadToCloudinary(file, "cover_images", [
      req.user.id,
    ]);

    const user = await updateUserField(req.user.id, { coverImage });

    res.status(200).json({
      success: true,
      message: "Cover image uploaded successfully",
      coverImage: user.coverImage,
    });
  } catch (error) {
    console.error("Failed to upload cover image:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to upload cover image" });
  }
});

// DELETE /api/images/rollback
const rollBackImageWithErrors = asyncHandler(async (req, res) => {
  const { publicId } = req.body;

  if (!publicId) {
    res
      .status(400)
      .json({
        success: false,
        error: "Public ID is required to rollback an asset.",
      });
    return;
  }

  const success = await deleteFromCloudinary(publicId);

  if (success) {
    res.status(200).json({
      success: true,
      message: "Asset successfully deleted from Cloudinary.",
    });
  } else {
    res.status(500).json({
      success: false,
      error: "Failed to delete asset from Cloudinary.",
    });
  }
});

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  signUpload,
  updateProfilePhoto,
  uploadImages,
  uploadCoverImage,
  rollBackImageWithErrors,
  deleteAccount,
};
