import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
  singInLoader: false,
  loadingSignUp: false,
  loadingUserDelete: false,
  signInError: null,
  signUpError: null,
  deleteUserError: null,
  token: null,
};

const UserSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    signInStart: (state) => {
      state.singInLoader = true;
    },
    signInSuccess: (state, action) => {
      state.singInLoader = false;
      state.currentUser = action.payload;
      state.signInError = null; // Reset error on success
      state.token = action.payload.token;
    },
    signInFailure: (state, action) => {
      state.singInLoader = false;
      state.signInError = action.payload; // Store the error message
    },
    signUpStart: (state) => {
      state.loadingSignUp = true;
    },
    signUpSuccess: (state, action) => {
      state.loadingSignUp = false;
      state.currentUser = action.payload; // Or other data if needed
      state.signUpError = null; // Reset error on success
    },
    signUpFailure: (state, action) => {
      state.loadingSignUp = false;
      state.signUpError = action.payload; // Store the error message
    },
    deleteUserStart: (state) => {
      state.loadingUserDelete = true;
    },
    deleteUserSuccess: (state, action) => {
      state.loadingUserDelete = false;
      state.currentUser = null; // Or other data if needed
      state.deleteUserError = null; // Reset error on success
      state.token = null;
    },
    deleteUserFailure: (state, action) => {
      state.loadingUserDelete = false;
      state.deleteUserError = action.payload; // Store the error message
    },
    // Add this action for updating the profile photo
    setProfilePhoto: (state, action) => {
      if (state.currentUser) {
        state.currentUser.profilePhoto = action.payload; // Update the profile photo URL
      }
    },
    signOut: (state) => {
      state.currentUser = null;
      state.token = null;
      state.signInError = null;
      state.signUpError = null;
    },
    clearErrors: (state) => {
      state.signInError = null;
      state.signUpError = null;
    },
  },
});

export const {
  signInStart,
  signInSuccess,
  signInFailure,
  signUpStart,
  signUpSuccess,
  signUpFailure,
  signOut,
  setProfilePhoto,
  clearErrors,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
} = UserSlice.actions;
export default UserSlice.reducer;
