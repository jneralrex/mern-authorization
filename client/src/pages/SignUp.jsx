import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  signUpFailure,
  signUpStart,
  signUpSuccess,
} from "../redux/user/UserSlice";
import OAuth from "../components/navigation/OAuth";

const SignUp = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [suggestions, setSuggestions] = useState([]); // State for suggested usernames
  const user = useSelector((state) => state.user);
  const loading = user.loadingSignUp;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true)
    try {
      dispatch(signUpStart());

      if (!formData.username || !formData.email || !formData.password) {
        dispatch(signUpFailure("Fields cannot be empty"));
        return;
      }

      const res = await axios.post("/api/auth/signup", formData);

      // Handle success
      setFormData({ username: "", email: "", password: "" });
      setSuggestions([]); // Clear suggestions on success
      dispatch(signUpSuccess(res.data));
      navigate("/sign-in");
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;

        if (status === 409) {
          setSuggestions(data?.suggestions || []);
          dispatch(signUpFailure(data.message || "Username already taken"));
          return;
        }

        dispatch(signUpFailure(data?.message || "Sign Up failed"));
      } else {
        console.error("Unexpected error:", error.message);
        dispatch(signUpFailure("Something went wrong!"));
      }
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-semibold my-7">Sign Up</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Username"
          id="username"
          className="bg-slate-100 p-3 rounded-lg"
          onChange={handleChange}
          value={formData.username}
        />
        <input
          type="email"
          placeholder="Email"
          id="email"
          className="bg-slate-100 p-3 rounded-lg"
          onChange={handleChange}
          value={formData.email}
        />
        <input
          type="password"
          placeholder="Password"
          id="password"
          className="bg-slate-100 p-3 rounded-lg"
          onChange={handleChange}
          value={formData.password}
        />
        <button
          disabled={loading}
          className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? "Loading..." : "Sign Up"}
        </button>
        <OAuth />
      </form>
      <div className="flex gap-2 mt-5">
        <p>Have an account?</p>
        <Link to="/sign-in">
          <span className="text-blue-500">Sign in</span>
        </Link>
      </div>
      {isSubmitted && user.signUpError && (
        <div className="mt-5">
          <p className="text-red-700">{user.signUpError}</p>
          {suggestions.length > 0 && (
            <div className="mt-3">
              <p className="text-gray-700">Try one of these usernames:</p>
              <ul className="list-disc ml-5">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="text-blue-500 cursor-pointer hover:underline"
                    onClick={() =>
                      setFormData({ ...formData, username: suggestion })
                    }
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SignUp;
