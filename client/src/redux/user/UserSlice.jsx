import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentUser: null,
  loadingSignIn: false,
  loadingSignUp: false,
  signInError: null,
  signUpError: null,
};

const UserSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    signInStart: (state) => {
      state.loadingSignIn = true;
    },
    signInSuccess: (state, action) => {
      state.loadingSignIn = false;
      state.currentUser = action.payload;
      state.signInError = null; // Reset error on success
    },
    signInFailure: (state, action) => {
      state.loadingSignIn = false;
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
  }
});

export const { signInStart, signInSuccess, signInFailure, signUpStart, signUpSuccess, signUpFailure } = UserSlice.actions;
export default UserSlice.reducer;
