import React, { useState } from "react";
// axios is not used in this file if login() handles it, but z, useNavigate are
import z from "zod";
import { useNavigate } from "react-router-dom";
import { login } from "../../api/api.js";
import { supabase } from "../../lib/supabase"; // NEW: Import Supabase client
import { FcGoogle } from "react-icons/fc"; // NEW: Import Google icon

// Your existing schema logic
const emailSchema = z.string().email("Invalid email address");
const usernameSchema = z.string().min(3, "Username must be at least 3 characters long");
const passwordSchema = z.string().min(8, "Password must be at least 8 characters long");

const validateForm = ({ email, username, password }) => {
  try {
    emailSchema.parse(email);
    usernameSchema.parse(username);
    passwordSchema.parse(password);
    return null;
  } catch (error) {
    return error instanceof z.ZodError ? error.errors[0].message : error.message;
  }
};

function LoginCard() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false); // NEW: Loading state for Google

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Your existing email/pass/username submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        email: formData.email,
        username: formData.username,
        password: formData.password,
      };

      const response = await login(payload);

      const token = response.data.message.accessToken;

      localStorage.setItem("accessToken", token);

      setSuccess("Login successful! Redirecting to dashboard...");
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  // NEW: Handler for Google Log-In
  const handleGoogleLogin = async () => {
    setError(""); // Clear previous errors
    setGoogleLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        // You can add redirect options here if needed
        // options: {
        //   redirectTo: 'http://localhost:3000/dashboard'
        // }
      });

      if (error) {
        throw new Error(error.message);
      }
      // On success, Supabase handles the redirect away from your app
      // and back. You don't need to navigate() here.
    } catch (err) {
      setError(err.message || "Something went wrong with Google Log-In");
      // Only set loading to false on error, as success redirects
      setGoogleLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-8 bg-white shadow-2xl rounded-2xl mt-12">
      {/* Header */}
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Log In to Your Account
      </h2>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-center">
          {success}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="you@example.com"
            required
          />
        </div>

        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            id="username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="john_doe"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="********"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || googleLoading} // UPDATED
          className={`w-full py-3 px-6 text-white text-lg rounded-lg transition
            ${
              loading || googleLoading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {loading ? "Logging In..." : "Log In"}
        </button>
      </form>

      {/* --- NEW: "OR" DIVIDER AND GOOGLE BUTTON --- */}
      {/* <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300"></span>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">
            Or continue with
          </span>
        </div>
      </div> */}

      {/* <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading || googleLoading}
        className={`w-full py-3 flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition ${
          (googleLoading || loading) && "opacity-50 cursor-not-allowed"
        }`}
      >
        <FcGoogle size={24} />
        {googleLoading ? "Redirecting..." : "Log In with Google"}
      </button> */}
      {/* --- END OF NEW UI --- */}

      {/* Signup Link */}
      <p className="mt-4 text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <a href="/signup" className="text-blue-600 hover:underline">
          Sign up
        </a>
      </p>
    </div>
  );
}

export default LoginCard;