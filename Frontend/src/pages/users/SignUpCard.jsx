import { useState } from "react";
import { useNavigate } from "react-router-dom";
import z from "zod";
import { signup , googleSignIn } from "@/api/api";
import { supabase } from "@/lib/supabase";

const Options = [
  { id: "fullName", label: "Full Name", type: "text", placeholder: "John Doe" },
  { id: "email", label: "Email", type: "email", placeholder: "you@example.com" },
  { id: "username", label: "Username", type: "text", placeholder: "john_doe" },
]

const formSchema = z.object({
  role: z.string(),
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid e-mail address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const ValidationCheck = ({ isValid, text }) => (
  <div className={`flex items-center text-sm ${isValid ? 'text-green-600' : 'text-gray-500'}`}>
    {isValid ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    )}
    {text}
  </div>
);

const EyeIcon = ({ onClick, isVisible }) => (
  <button type="button" onClick={onClick} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500">
    {isVisible ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 .525-1.666 1.487-3.16 2.684-4.354M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.598 14.36A9.955 9.955 0 0121.542 12c-1.274-4.057-5.064-7-9.542-7-1.71 0-3.32.52-4.686 1.432M2 2l20 20" />
      </svg>
    )}
  </button>
);

function SignUpCard() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    role: "",
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const handleChange = (e) => {
    setMsg({ type: "", text: "" });
    setFormData(prev => {
      const updated = { ...prev, [e.target.name]: e.target.value };
      if (e.target.name === "password") {
        setIsPasswordFocused(e.target.value.length > 0);
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: "", text: "" });

    const result = formSchema.safeParse(formData);

    if (!result.success) {
      const errorMessage = result.error.errors[0].message;
      setMsg({ type: "error", text: errorMessage });
      setLoading(false);
      return;
    }

    try {
      const response = await signup(result.data);
      console.log("Form submitted successfully:", result.data);
      setMsg({ type: "success", text: "Account created! Redirecting..." });
      await new Promise(resolve => setTimeout(resolve, 2000));
      navigate("/login");
    } catch (apiError) {
      setMsg({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });

      console.log('Data:', data);

      if (error) {
        console.error('Error:', error.message);
        setMsg({ type: "error", text: "Google signup failed." });
        return;
      }

      const user = data?.user;
      if (!user) {
        setMsg({ type: "error", text: "No user returned from Google signup." });
        return;
      }

      console.log('Google user:');

      await googleSignIn(user);
    } catch (err) {
      console.error('Unexpected error:', err);
      setMsg({ type: "error", text: "An unexpected error occurred during Google signup." });
    }
  }

  const passwordValidations = {
    length: formData.password.length >= 8,
    lowercase: /[a-z]/.test(formData.password),
    uppercase: /[A-Z]/.test(formData.password),
    number: /\d/.test(formData.password),
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white shadow-xl rounded-2xl">
      <h2 className="text-3xl font-bold text-center mb-6">Create Account</h2>

      {msg.text && (
        <div
          className={`p-3 mb-4 rounded-lg text-center ${msg.type === "error"
            ? "bg-red-100 text-red-700"
            : "bg-green-100 text-green-700"
            }`}
        >
          {msg.text}
        </div>
      )}

      {/* Google Signup */}
      <div className="mb-4">
        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" focusable="false">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign up with Google
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Role
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="" disabled>
              Select role
            </option>
            <option value="user">User</option>
            <option value="author">Author</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {Options.map(({ id, label, type, placeholder }) => (
          <div key={id}>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700">
              {label}
            </label>
            <input
              id={id}
              name={id}
              type={type}
              value={formData[id]}
              onChange={handleChange}
              placeholder={placeholder}
              required
              className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        ))}

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a Password"
              required
              className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <EyeIcon isVisible={showPassword} onClick={() => setShowPassword(!showPassword)} />
          </div>

          {isPasswordFocused && (
            <div className="mt-2 space-y-1">
              <ValidationCheck isValid={passwordValidations.length} text="At least 8 characters" />
              <ValidationCheck isValid={passwordValidations.uppercase} text="One uppercase letter" />
              <ValidationCheck isValid={passwordValidations.lowercase} text="One lowercase letter" />
              <ValidationCheck isValid={passwordValidations.number} text="One number" />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
              className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <EyeIcon isVisible={showConfirmPassword} onClick={() => setShowConfirmPassword(!showConfirmPassword)} />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white text-lg transition ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {loading ? "Signing Up…" : "Sign Up"}
        </button>
      </form>

      <p className="text-sm text-center text-gray-600 mt-4">
        Already have an account?{" "}
        <a href="/login" className="text-blue-600 hover:underline">
          Log In
        </a>
      </p>
    </div>
  );
}

export default SignUpCard;