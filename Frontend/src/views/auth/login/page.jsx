import React, { useState } from "react";
import z from "zod";
import { useNavigate, Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { login as apiLogin } from "@/api/api";
import { useAuth } from "@/hooks/AuthContext";
import AuthSplitLayout from "../page";
import GoogleAuth from "@/components/auth/google-auth";
import { LOCAL_STORAGE_KEY } from "@/utils/local-storage-key";

const emailSchema = z.string().email("Invalid email address");
const passwordSchema = z.string().min(8, "Password must be at least 8 characters long");

const validateForm = ({ email, password }) => {
  try {
    emailSchema.parse(email);
    passwordSchema.parse(password);
    return null;
  } catch (error) {
    return error instanceof z.ZodError ? error.errors[0].message : error.message;
  }
};

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:8000/api/v1";

function LoginCard() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
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
        password: formData.password,
      };

      const response = await apiLogin(payload);

      if (response.data.success) {
        localStorage.setItem(LOCAL_STORAGE_KEY.IS_LOGGED_IN, "true");
        // The backend now returns user info in response.data.data (minus tokens which are in cookies)
        // If it also returns a token in the body (fallback), we pass it.
        const userData = response.data.data;
        const token = response.data.accessToken || response.data.message?.accessToken;
        
        login(token || userData);
        setSuccess("Login successful! Redirecting...");

        setTimeout(() => {
          navigate("/");
        }, 800);
      }
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || err.message || "Invalid credentials";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };


  const inputClass =
    "mt-1.5 w-full px-3.5 py-3 text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-xl bg-gray-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition";

  return (
    <AuthSplitLayout>
      <div className="rounded-2xl border border-gray-200/80 bg-white/90 backdrop-blur-sm shadow-xl shadow-gray-200/50 p-8 sm:p-9">
          <div className="text-center mb-8">
            <p className="text-sm font-medium text-blue-600 mb-1">CodeSM</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Sign in to continue to your account
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              <span className="mt-0.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div
              role="status"
              className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
            >
              <span className="mt-0.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className={inputClass}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                name="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                className={inputClass}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className={`w-full py-3.5 px-4 rounded-xl text-white text-base font-semibold shadow-sm transition
                ${
                  loading || googleLoading
                    ? "bg-blue-400 cursor-not-allowed shadow-none"
                    : "bg-blue-600 hover:bg-blue-700 hover:shadow-md active:scale-[0.99]"
                }`}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center" aria-hidden>
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs font-medium uppercase tracking-wide">
              <span className="bg-white px-3 text-gray-400">Or continue with</span>
            </div>
          </div>

          <GoogleAuth
            className="w-full"
            label="Google"
            onLoadingChange={setGoogleLoading}
            disabled={loading}
          />

          <p className="text-sm text-center text-gray-500 mt-8">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-700 hover:underline underline-offset-2">
              Create one
            </Link>
          </p>
      </div>
    </AuthSplitLayout>
  );
}

export default LoginCard;
