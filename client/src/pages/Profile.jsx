import React, { useRef, useState, } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { deleteUserFailure, deleteUserStart, deleteUserSuccess, setProfilePhoto, signOut } from "../redux/user/UserSlice";
import { useNavigate } from "react-router-dom";
import API from "../utils/Api";

const Profile = () => {
  const { currentUser } = useSelector((state) => state.user);
  console.log("current user",currentUser);

  const dispatch = useDispatch(); // Initialize dispatch
  const navigate = useNavigate()
  const fileRef = useRef(null);
  const [profilePhoto, setProfilePhotoState] = useState(
    currentUser.user.profilePhoto
  );
  const [previewPhoto, setPreviewPhoto] = useState(currentUser.user.profilePhoto); // For image preview
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // To handle errors
  const [imageProgress, setImageProgress] = useState(0); // To track progress
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState(""); // Success message state


  const rollbackUpload = async (publicId) => {
    try {
      await axios.post("/api/image-management/rollback", {
        public_id: publicId,
      });
    } catch (error) {}
  };

 // PATCH /api/profile-picture-update/update/:id
const handleFileUpload = async (file) => {
  let uploadedPublicId = null; // Declare this variable in the higher scope
  try {
    setLoading(true);
    setError(null); // Reset error

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only JPEG, PNG, WEBP and GIF files are allowed.");
      setLoading(false);
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / 1024 / 1024; // Convert bytes to MB
    if (fileSizeMB > 2) {
      setError("File size exceeds the 2MB limit.");
      setLoading(false);
      return;
    }

    // 1. Get the signed upload details from the backend
    const { data } = await API.post(`/profile-picture-upload/sign-upload`);
    const { signature, timestamp, cloudName, apiKey } = data;

    // 2. Prepare the upload form data
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("folder", "profile_pictures");

    // 3. Upload to Cloudinary with progress tracking
    const uploadRes = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      formData,
      {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setImageProgress(progress); // Update progress
        },
      }
    );

    // Validate Cloudinary response
    if (!uploadRes.data || !uploadRes.data.secure_url) {
      throw new Error("Cloudinary upload failed. Please try again.");
    }

    const transformedUrl = uploadRes.data.secure_url;
    uploadedPublicId = uploadRes.data.public_id; // Store public ID for rollback

    // 4. Send the new photo URL and publicId to your backend to update the user profile
    await API.patch(
      `/profile-picture-update/update/${currentUser._id}`,
      {
        profilePhoto: transformedUrl,  // URL of the uploaded photo
        publicId: uploadedPublicId,    // Public ID of the uploaded photo
      },
      {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,  // Ensure token is passed in the headers
        },
      }
    );

    // 5. Update the Redux store with the new profile photo URL
    dispatch(setProfilePhoto(transformedUrl)); // Dispatch the action

    // 6. Update the local component state as well
    setProfilePhotoState(transformedUrl);
    setPreviewPhoto(transformedUrl); // Update the preview
    setLoading(false);

    // Clear the file input for next use
    fileRef.current.value = "";
  } catch (error) {
    console.error("Error uploading file:", error);

    // Optional: Rollback Cloudinary upload by deleting the asset
    if (uploadedPublicId) {
      await rollbackUpload(uploadedPublicId); // Rollback only if public_id is available
    }

    setError("An error occurred while uploading the photo. Please try again.");
    setLoading(false);
  }
};

const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (in MB)
      const fileSizeMB = file.size / 1024 / 1024; // Convert bytes to MB
      if (fileSizeMB > 2) {
        setError("File size exceeds the 2MB limit.");
        return;
      }
      // Preview the selected image without updating the profile photo
      setPreviewPhoto(URL.createObjectURL(file));
    }
  };

 const handleSubmit = (e) => {
    e.preventDefault();
    if (fileRef.current.files.length > 0) {
      handleFileUpload(fileRef.current.files[0]);
    }
  };

 const handleDeleteAccount = async (e) => {
    e.preventDefault();
    try {
      dispatch(deleteUserStart());
  
      // Get the token from localStorage or cookies
  
      const res = await API.delete(`/delete-account/delete/${currentUser._id}`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });

      if (res.data.success === false) {
        dispatch(deleteUserFailure(res.data?.message));
        return;
      }
  
      // Dispatch an action to clear the user data after successful deletion
      dispatch(signOut());  // Make sure this action clears the user state
      
      dispatch(deleteUserSuccess());
      // navigate("/signup")
      console.log(res)
    } catch (error) {
      dispatch(deleteUserFailure(error.response?.data?.message || "Something went wrong!"));
      console.log(error,'deleting')
    }
  };  


const handleSignout = async(e) =>{
  e.preventDefault();
  try {
    await axios.get('/api/auth/signout');
    dispatch(signOut())
    // navigate('/sign-in')
  } catch (error) {
    
  }
}


return (
  <div className="bg-gray-100 min-h-screen">
    {/* Profile Header */}
    <div className="bg-blue-600 text-white py-6">
      <div className="container mx-auto text-center">
        <h1 className="text-3xl font-bold">Your Profile</h1>
        <p className="text-lg mt-2">{`Hello, ${currentUser.user.username}`}</p>
      </div>
    </div>

    {/* Success Toast */}
    {successMessage && (
      <div className="fixed top-4 right-4 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg">
        {successMessage}
      </div>
    )}

    {/* Profile Content */}
    <div className="container mx-auto py-8 px-4 md:px-0">
      <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto">
        {/* Profile Photo */}
        <div className="text-center">
          <img
            src={previewPhoto}
            alt="profile"
            className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-blue-600 cursor-pointer"
            onClick={() => fileRef.current.click()}
          />
          <input
            type="file"
            ref={fileRef}
            hidden
            accept="image/*"
            onChange={handleFileChange}
          />
          <p className="mt-3 text-sm text-gray-500">
            Click the photo to change your profile picture.
          </p>
        </div>

        {/* Progress Bar */}
        {loading && (
          <div className="mt-4">
            <progress
              value={imageProgress}
              max="100"
              className="w-full"
            ></progress>
            <p className="text-center text-sm text-gray-600 mt-2">{`${imageProgress}% Uploaded`}</p>
          </div>
        )}

        {/* Profile Details */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="username" className="block text-gray-700">
              Username
            </label>
            <input
              id="username"
              type="text"
              defaultValue={currentUser.username}
              className="w-full p-3 rounded-lg bg-gray-100 border focus:outline-blue-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              defaultValue={currentUser.email}
              className="w-full p-3 rounded-lg bg-gray-100 border focus:outline-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="New Password"
              className="w-full p-3 rounded-lg bg-gray-100 border focus:outline-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-500 transition duration-300"
          >
            {loading ? "Uploading..." : "Update Profile"}
          </button>
        </form>

        {/* Error Message */}
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}

        {/* About Me */}
        <div className="mt-6">
          <label htmlFor="about" className="block text-gray-700">
            About Me
          </label>
          <textarea
            id="about"
            rows="4"
            placeholder="Tell us something about yourself..."
            className="w-full p-3 rounded-lg bg-gray-100 border focus:outline-blue-500"
          ></textarea>
        </div>
        <div>
    <label htmlFor="twitter" className="block text-gray-700">Twitter</label>
    <input
      id="twitter"
      type="url"
      placeholder="https://twitter.com/yourprofile"
      className="w-full p-3 rounded-lg bg-gray-100 border focus:outline-blue-500"
    />
  </div>
  <div>
    <label htmlFor="linkedin" className="block text-gray-700">LinkedIn</label>
    <input
      id="linkedin"
      type="url"
      placeholder="https://linkedin.com/in/yourprofile"
      className="w-full p-3 rounded-lg bg-gray-100 border focus:outline-blue-500"
    />
  </div>

        {/* Notification Settings */}
        <div className="mt-10 bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Notification Settings</h2>
          <label className="flex items-center justify-between">
            <span className="text-gray-700">Email Notifications</span>
            <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" />
          </label>
          <label className="flex items-center justify-between mt-4">
            <span className="text-gray-700">Push Notifications</span>
            <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" />
          </label>
        </div>

        <div className="mt-10 bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Security Settings</h2>
          <label className="flex items-center justify-between">
          <span className="text-gray-700">Enable Two-Factor Authentication</span>
          <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" />
          </label>
        </div>

        <div className="mt-10 bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Display Settings</h2>
          <label className="flex items-center justify-between">
          <span className="text-gray-700">Dark mode</span>
          <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" />
          </label>
        </div>

        <div className="mt-10 bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Privacy & Visibility</h2>
          <label className="flex items-center justify-between">
          <span className="text-gray-700">Dark mode</span>
          <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" />
          </label>
        </div>
        <div className="mt-6 space-y-4">
 
</div>

        {/* Actions */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="text-red-600 hover:underline"
          >
            Delete Account
          </button>
          <button
            onClick={handleSignout}
            className="text-blue-600 hover:underline"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>

    {/* Delete Account Confirmation Modal */}
    {showDeleteModal && (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold">Are you sure?</h3>
          <p className="mt-2 text-sm text-gray-600">
            This action cannot be undone. Your account and data will be permanently deleted.
          </p>
          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              className="px-4 py-2 bg-red-600 text-white rounded-lg"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default Profile;
