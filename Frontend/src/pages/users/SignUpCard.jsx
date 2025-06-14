import React, { useState } from "react";
import axios from "axios";
import z from "zod";
import { useNavigate } from "react-router-dom";

const emailSchema = z.string().email("Invalid email address");
const fullNameSchema = z.string().min(3, "Full name must be at least 3 characters long");
const usernameSchema = z.string().min(3, "Username must be at least 3 characters long");
const passwordSchema = z.string().min(8, "Password must be at least 8 characters long");

const validateForm = ({ email, fullName, username, password, cpassword }) => {
  try {
    emailSchema.parse(email);
    fullNameSchema.parse(fullName);
    usernameSchema.parse(username);
    passwordSchema.parse(password);

    if (password !== cpassword) {
      throw new Error("Passwords do not match");
    }

    return null;
  } catch (error) {
    return error instanceof z.ZodError ? error.errors[0].message : error.message;
  }
};

function SignUpCard() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    cpassword: "",
    avatar: null,
    links: {
      github: "",
      linkedin: "",
      website: "",
    },
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
    } 
    else if (name.startsWith("links.")) {
      const linkKey = name.split(".")[1];
      setFormData({
        ...formData,
        links: { ...formData.links, [linkKey]: value },
      });
    } 
    else {
      setFormData({ ...formData, [name]: value });
    }
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

      const formDataToSend = new FormData();
      formDataToSend.append("fullName", formData.fullName);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("username", formData.username);
      formDataToSend.append("password", formData.password);
      if (formData.avatar) formDataToSend.append("avatar", formData.avatar);
      formDataToSend.append("links", JSON.stringify(formData.links));

      const response = await axios.post("http://localhost:8000/api/v1/users/register", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log(response.data);

      setSuccess("Signup successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-8 bg-white shadow-2xl rounded-2xl mt-12">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Create Your Account
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
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="John Doe"
            required
          />
        </div>

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

        <div>
          <label htmlFor="cpassword" className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <input
            id="cpassword"
            type="password"
            name="cpassword"
            value={formData.cpassword}
            onChange={handleChange}
            className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="********"
            required
          />
        </div>

        <div>
          <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">
            Upload Avatar (PNG, JPG, JPEG)
          </label>
          <input
            id="avatar"
            type="file"
            name="avatar"
            accept=".png,.jpg,.jpeg"
            onChange={handleChange}
            className="mt-1 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100 transition"
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Social Links</label>
          {[
            { key: "github", placeholder: "GitHub URL" },
            { key: "linkedin", placeholder: "LinkedIn URL" },
            { key: "website", placeholder: "Personal Website URL" },
          ].map(({ key, placeholder }) => (
            <div key={key}>
              <input
                type="url"
                name={`links.${key}`}
                value={formData.links[key]}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
        <div className="text-sm text-gray-600">
          By signing up, you agree to our{" "}
          <a href="/terms" className="text-blue-600 hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-blue-600 hover:underline">
            Privacy Policy
          </a>.
        </div>
        <div className="text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Log In
          </a>
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-6 text-white text-lg rounded-lg transition
            ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}

export default SignUpCard;