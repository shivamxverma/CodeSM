import React, { useState } from "react";
import z from "zod";
import { useNavigate } from "react-router-dom";
import { login as apiLogin } from "../../api/api.js";
// import { supabase } from "../../lib/supabase"; 
import { useAuth } from "../../auth/AuthContext.jsx";
import { usePostHog } from '@posthog/react'

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
  const { login } = useAuth(); // ✅ Get context login function
  const posthog = usePostHog();

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    posthog.capture("login_attempt", {
      email: formData.email,
      username: formData.username,
    });
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

      // 1. Call Backend
      const response = await apiLogin(payload);

      // 2. Extract Token
      const token = response.data.message.accessToken || response.data.accessToken;

      if (!token) throw new Error("No access token received");

      // 3. ✅ Update Context (State + LocalStorage)
      login(token);

      posthog.capture("login_success", {
        email: formData.email,
        username: formData.username,
      });

      setSuccess("Login successful! Redirecting...");

      setTimeout(() => {
        navigate("/");
      }, 500);

    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || err.message || "Invalid credentials";
      posthog.capture("login_failure", {
        email: formData.email,
        username: formData.username,
        error: errorMsg,
      });
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // const handleGoogleLogin = async () => {
  //   setError("");
  //   setGoogleLoading(true);
  //   try {
  //     const { error } = await supabase.auth.signInWithOAuth({
  //       provider: "google",
  //     });
  //     if (error) throw new Error(error.message);
  //   } catch (err) {
  //     setError(err.message || "Something went wrong with Google Log-In");
  //     setGoogleLoading(false);
  //   }
  // };

  return (
    <div className="max-w-lg mx-auto p-8 bg-white shadow-2xl rounded-2xl mt-12">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Log In to Your Account
      </h2>

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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
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

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
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

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
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

        <button
          type="submit"
          disabled={loading || googleLoading}
          className={`w-full py-3 px-6 text-white text-lg rounded-lg transition
            ${loading || googleLoading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {loading ? "Logging In..." : "Log In"}
        </button>

        {/* Google Login Button */}
        <button
          type="button"
          disabled={googleLoading}
          onClick={() => {
            // Redirect to backend Google OAuth entry point
            const base = 'http://localhost:8000/api/v1/users';
            window.location.href = `${base}/auth/google`;
          }}
          className={`w-full py-3 px-6 mt-4 text-white text-lg rounded-lg transition ${googleLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
        >
          {googleLoading ? 'Redirecting...' : 'Continue with Google'}
        </button>
      </form>
    </div>
  );
}

export default LoginCard;
