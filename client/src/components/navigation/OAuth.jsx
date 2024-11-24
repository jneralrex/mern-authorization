// import React, { useEffect, useState } from 'react';
// import { useDispatch } from 'react-redux';
// import { GoogleAuthProvider, getAuth, signInWithRedirect, getRedirectResult, signInWithPopup } from 'firebase/auth';
// import axios from 'axios';
// import { signUpSuccess } from '../../redux/user/UserSlice';
// import { app } from '../../firebase';

// const OAuth = () => {
//   const [loading, setLoading] = useState(false);
//   const dispatch = useDispatch();

//   // Handling Google Auth Redirect Result
//   useEffect(() => {
//     const handleRedirectResult = async () => {
//       const auth = getAuth(app);
//       try {
//         const result = await getRedirectResult(auth);
//         if (result) {
//           const { displayName, email, photoURL } = result.user;
//           const res = await axios.post('/api/auth/google', {
//             username: displayName,
//             email,
//             profilePhoto: photoURL,
//           });

//           // Dispatch user data after successful signup/login
//           dispatch(signUpSuccess(res.data));
//         }
//       } catch (error) {
//         console.error('Error handling redirect result:', error.response?.data || error.message);
//       }
//     };
//     handleRedirectResult();
//   }, [dispatch]);

//   // Handling Google Sign-In Popup
//   const handleGoogleClick = async () => {
//     setLoading(true);
//     const provider = new GoogleAuthProvider();
//     const auth = getAuth();
//     try {
//       // Sign-in with popup
//       await signInWithPopup(auth, provider);
//     } catch (error) {
//       console.error('Google Sign-In Error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <button
//       onClick={handleGoogleClick}
//       disabled={loading}
//       className="bg-red-700 text-white p-3 uppercase rounded-lg hover:opacity-95"
//     >
//       {loading ? 'Loading...' : 'Continue with Google'}
//     </button>
//   );
// };

// export default OAuth;


import React, { useState } from 'react';
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { app } from '../../firebase';
import { useDispatch } from 'react-redux';
import axios from 'axios';  // Make sure to import axios
import { signInSuccess } from '../../redux/user/UserSlice';

const OAuth = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleGoogleClick = async () => {
    setLoading(true);
    try {
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();

      // Wait for the sign-in process to complete
      const result = await signInWithPopup(auth, provider);
      const postRes = await axios.post('/api/auth/google', {
        username: result.user.displayName,
        email: result.user.email,
        profilePhoto: result.user.photoURL
      });

      // Dispatch the user data (ensure the payload is correct)
      dispatch(signInSuccess(postRes.data));  // Pass postRes.data instead of the full response object

      // Log the result if necessary
      console.log(result);

      // You can also access the user data like this
      const user = result.user;
      console.log("User:", user);

    } catch (error) {
      console.log("Could not register", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleClick}
      disabled={loading}
      className="bg-red-700 text-white p-3 uppercase rounded-lg hover:opacity-95"
    >
      {loading ? 'Loading...' : 'Continue with Google'}
    </button>
  );
};

export default OAuth;
