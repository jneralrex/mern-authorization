import React, { useState } from "react";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { signInStart, signInSuccess, signInFailure } from "../redux/user/UserSlice";
import { useDispatch, useSelector } from "react-redux";
import OAuth from "../components/navigation/OAuth";
import Spinner from "../components/navigation/Spinner";
import API from "../utils/Api";

const SignIn = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const signInSpinner = user.loadingSignIn;

  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  });

  const [errors, setErrors] = useState({ usernameOrEmail: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);

  const validationSchema = yup.object().shape({
    usernameOrEmail: yup.string().required("Username or email is required"),
    password: yup
      .string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRememberMeChange = () => {
    setRememberMe(!rememberMe);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      await validationSchema.validate(formData, { abortEarly: false });
      dispatch(signInStart());

      const { usernameOrEmail, password } = formData;
      const res = await API.post("/auth/sign-in", { usernameOrEmail, password });
      console.log(res)
      if (res.status !== 200 || !res.data) {
        throw new Error(res.data?.message || "Login failed");
      }

      setFormData({ usernameOrEmail: "", password: "" });

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("token", res.data.token);
      console.log(res.data?.user?.role);
      console.log(res.data)
      dispatch(signInSuccess(res.data));
      navigate(res.data?.user?.role === "admin" ? "/admin" : "/nav/fyp");
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const newErrors = error.inner.reduce((acc, curr) => {
          acc[curr.path] = curr.message;
          return acc;
        }, {});
        setErrors(newErrors);
      } else {
        dispatch(signInFailure(error.response?.data?.message || "Something went wrong!"));
      }
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-semibold my-7">Sign In</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label htmlFor="usernameOrEmail" className="sr-only">Username or Email</label>
        <input
          type="text"
          placeholder="Email or Username"
          id="usernameOrEmail"
          className="bg-slate-100 p-3 rounded-lg"
          onChange={handleChange}
          value={formData.usernameOrEmail}
        />
        {errors.usernameOrEmail && <p className="text-red-500 text-xs">{errors.usernameOrEmail}</p>}

        <label htmlFor="password" className="sr-only">Password</label>
        <input
          type="password"
          placeholder="Password"
          id="password"
          className="bg-slate-100 p-3 rounded-lg"
          onChange={handleChange}
          value={formData.password}
        />
        {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={rememberMe} onChange={handleRememberMeChange} />
          Remember me
        </label>

        <button
          disabled={signInSpinner}
          className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
        >
          {signInSpinner ? <Spinner /> : "Sign In"}
        </button>
        <OAuth />
      </form>
      <div className="flex gap-2 mt-5">
        <p>Don't have an account?</p>
        <Link to="/signup">
          <span className="text-blue-500">Sign up</span>
        </Link>
      </div>
      {user.signInError && (
        <p className="text-red-700 mt-5">{user.signInError}</p>
      )}
    </div>
  );
};

export default SignIn;
