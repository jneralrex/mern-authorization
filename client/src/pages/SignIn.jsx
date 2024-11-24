import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { signInStart, signInSuccess, signInFailure } from "../redux/user/UserSlice";
import { useDispatch, useSelector } from "react-redux";
import OAuth from "../components/navigation/OAuth";

const SignIn = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const loading = user.loadingSignIn;

  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false); // Track if the form has been submitted

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true); // Mark the form as submitted
    try {
      dispatch(signInStart());
      const { usernameOrEmail, password } = formData;  // Destructure formData
  
      // Validate input (either email or username must be provided)
      if (!usernameOrEmail || !password) {
        dispatch(signInFailure("Email/Username and password are required!"));
        return;
      }
  
      // Send the formData in the request
      const res = await axios.post("/api/auth/sign-in", { usernameOrEmail, password });
  
      if (res.status !== 200 || !res.data) {
        dispatch(signInFailure(res.data?.message || "Login failed"));
        return;
      }
  
      setFormData({
        usernameOrEmail: "",
        password: "",
      });
      dispatch(signInSuccess(res.data));
      navigate(user.role === "admin" ? "/admin" : "/nav/home");
    } catch (error) {
      dispatch(signInFailure(error.response?.data?.message || "Something went wrong!"));
    }
  };
  

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-semibold my-7">Sign In</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Email or Username"
          id="usernameOrEmail"
          className="bg-slate-100 p-3 rounded-lg"
          onChange={handleChange}
          value={formData.usernameOrEmail}
        />
        <input
          type="password"
          placeholder="Password"
          id="password"
          className="bg-slate-100 p-3 rounded-lg"
          onChange={handleChange}
          value={formData.password}
        />
        <button disabled={loading} className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80">
          {loading ? "Loading..." : "Sign In"}
        </button>
        <OAuth />
      </form>
      <div className="flex gap-2 mt-5">
        <p>Don't have an account?</p>
        <Link to="/signup">
          <span className="text-blue-500">Sign up</span>
        </Link>
      </div>
      {isSubmitted && user.signInError && (
        <p className="text-red-700 mt-5">{user.signInError}</p>
      )}
    </div>
  );
};

export default SignIn;
