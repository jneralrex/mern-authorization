// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIRE_BASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIRE_BASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIRE_BASE_PROJECT_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIRE_BASE_MESSAGE_SENDER_ID,
  appId: import.meta.env.VITE_FIRE_BASE_MESSAGE_APP_ID
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);