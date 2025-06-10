import React, { useState } from "react";
import axios from "axios";
import z from "zod";
import { useNavigate } from "react-router-dom";

const emailSchema = z.string().email();
const usernameSchema = z.string().min(3, "Username must be at least 3 characters long");
const passwordSchema = z.string().min(8, "Password must be at least 8 characters long");

const validateForm = (email, username, password, cpassword) => {
  try {
    emailSchema.parse(email);
    usernameSchema.parse(username);
    passwordSchema.parse(password);

    if (password !== cpassword) {
      throw new Error("Passwords do not match");
    }

    return null;
  } catch (error) {
    return error.message;
  }
};

function SignUpCard() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [cpassword, setCpassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateForm(email, username, password, cpassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("/api/signup", {
        email,
        username,
        password,
      });

      setSuccess("Signup successful!");
      setEmail("");
      setUsername("");
      setPassword("");
      setCpassword("");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup">
      <h1>SignUp Page</h1>

      {error && <div className="error-popup">{error}</div>}
      {success && <div className="success-popup">{success}</div>}

      <form onSubmit={handleSubmit}>
        <input
          className="signup-fields"
          type="email"
          placeholder="Email id"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="signup-fields"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="signup-fields"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          className="signup-fields"
          type="password"
          placeholder="Confirm Password"
          value={cpassword}
          onChange={(e) => setCpassword(e.target.value)}
        />
        <button className="submit-button" type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}

export default SignUpCard;
