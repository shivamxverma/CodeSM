import { useState } from "react";
import { useNavigate } from "react-router-dom";
import z from "zod";
import { signup } from "@/api/api";
// import { supabase } from "@/lib/supabase"; 
import { FcGoogle } from "react-icons/fc";
import { usePostHog } from "@posthog/react";

const formSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Invalid e-mail address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string()
    .min(8, "min 8 chars")
    .max(128, "max 128 chars")
    .regex(/[a-z]/, "need lowercase")
    .regex(/[A-Z]/, "need uppercase")
    .regex(/\d/, "need digit")
    .regex(/[^A-Za-z0-9]/, "need symbol"),
});

// (scorePwd and getLbl functions remain the same)
const scorePwd = (s) => {
  let n = 0;
  if (/[a-z]/.test(s)) n++;
  if (/[A-Z]/.test(s)) n++;
  if (/\d/.test(s)) n++;
  if (/[^A-Za-z0-9]/.test(s)) n++;
  if (s.length >= 12) n++;
  if (s.length >= 16) n++;
  return Math.min(n, 5);
};

const getLbl = (s) => {
  const n = scorePwd(s);
  if (n <= 2) return { t: "weak", v: 33, c: "bg-red-500" };
  if (n <= 4) return { t: "okay", v: 66, c: "bg-yellow-500" };
  return { t: "strong", v: 100, c: "bg-green-500" };
};


function SignUpCard() {
  const navigate = useNavigate();
  const posthog = usePostHog();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
  });

  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false); // NEW: Loading state for Google

  const Options = [
    { id: "email", label: "Email", type: "email", placeholder: "you@example.com" },
    // NOTE: Your original code had 'fullName' here, but your formSchema and state
    // only have 'username'. I'm following your schema. If you need 'fullName',
    // you'll need to add it to the schema and state.
    { id: "fullName", label: "fullName", type: "fullName", placeholder: "john doe" },
    { id: "username", label: "Username", type: "text", placeholder: "john_doe" },
  ];

  const strength = getLbl(formData.password);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    const parse = formSchema.safeParse(formData);
    if (!parse.success) {
      const errorMsg = parse.error.errors[0].message;
      posthog.capture("signup_validation_error", { error: errorMsg });
      setMsg({ type: "error", text: errorMsg });
      return;
    }

    try {
      posthog.capture("signup_attempt", {
        email: formData.email,
        username: formData.username,
        fullName: formData.fullName,
      });
      setLoading(true);
      await signup(formData); // This is your custom API call

      setMsg({ type: "success", text: "Signup successful! Redirecting…" });
      posthog.capture("signup_success", {
        email: formData.email,
        username: formData.username,
      });
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Something went wrong";
      posthog.capture("signup_failure", {
        email: formData.email,
        username: formData.username,
        error: errorMsg,
      });
      setMsg({
        type: "error",
        text: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  // Sign-up with Google — same OAuth flow as login
  // passport.config.js will create a new user if they don't exist
  const handleGoogleSignUp = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/users/auth/google`;
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

      <form onSubmit={handleSubmit} className="space-y-5">
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
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="********"
            required
            className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {formData.password.length > 0 && (
            <div className="mt-2">
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className={`h-2 rounded-full ${strength.c} transition-all duration-300`}
                  style={{ width: `${strength.v}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-600 capitalize float-right mt-1">
                {strength.t}
              </span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading} // NEW: Disable if Google auth is loading
          className={`w-full py-3 rounded-lg text-white text-lg transition ${(loading || googleLoading)
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {loading ? "Signing Up…" : "Sign Up"}
        </button>
      </form>

      {/* OR divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300"></span>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">Or continue with</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignUp}
        disabled={googleLoading || loading}
        className={`w-full py-3 flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition ${(googleLoading || loading) ? "opacity-50 cursor-not-allowed" : ""
          }`}
      >
        <FcGoogle size={24} />
        {googleLoading ? "Redirecting..." : "Sign Up with Google"}
      </button>


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