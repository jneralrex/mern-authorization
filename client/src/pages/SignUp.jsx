import React, { useState } from "react";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  signUpFailure,
  signUpStart,
  signUpSuccess,
} from "../redux/user/UserSlice";
import OAuth from "../components/navigation/OAuth";
import API from "../utils/Api";
import Spinner from "../components/navigation/Spinner";

const SignUp = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const validationSchema = yup.object().shape({
    username: yup.string().required("Username is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  });
  const [errors, setErrors] = useState({ username: "", email: "", password: "" });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [suggestions, setSuggestions] = useState([]); // State for suggested usernames
  const user = useSelector((state) => state.user);
  const loading = user.loadingSignUp;

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ username: "", email: "", password: "" });
    setIsSubmitted(true);
  
    try {
      dispatch(signUpStart());
      await validationSchema.validate(formData, { abortEarly: false });
  
      // Assuming your API request
      const res = await API.post('/auth/signup', formData);
  
      // Reset form data and clear suggestions
      setFormData({ username: "", email: "", password: "" });
      setSuggestions([]);
      
      // Dispatch success action
      dispatch(signUpSuccess(res.data));
      
      // Navigate to the sign-in page
      navigate("/sign-in");
    } catch (error) {
      // Handle validation errors
      if (error instanceof yup.ValidationError) {
        const newErrors = error.inner.reduce((acc, curr) => {
          acc[curr.path] = curr.message;
          return acc;
        }, {});
        setErrors(newErrors);
      } else if (error.response) {
        const { status, data } = error.response;
        if (status === 409) {
          setSuggestions(data?.suggestions || []);
          dispatch(signUpFailure(data.message || "Username already taken"));
        } else {
          dispatch(signUpFailure(data?.message || "Sign Up failed"));
        }
      } else {
        dispatch(signUpFailure("Something went wrong!"));
      }
    }
  };
  

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-semibold my-7">Sign Up</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <input
            type="text"
            id="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            className="bg-slate-100 p-3 rounded-lg w-full"
          />
          {errors.username && <p className="text-red-500 text-xs">{errors.username}</p>}
        </div>
        <div>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="bg-slate-100 p-3 rounded-lg w-full"
          />
          {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
        </div>
        <div>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="bg-slate-100 p-3 rounded-lg w-full"
          />
          {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
        </div>
        <button
          disabled={loading || !formData.username || !formData.email || !formData.password}
          className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? <Spinner /> : "Sign Up"}
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
                    onClick={() => setFormData({ ...formData, username: suggestion })}
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
