import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import z from "zod";
import { signup } from "@/api/api";
import { FcGoogle } from "react-icons/fc";
import AuthSplitLayout from "../AuthSplitLayout.jsx";

const formSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid e-mail address"),
    password: z
      .string()
      .min(8, "min 8 chars")
      .max(128, "max 128 chars")
      .regex(/[a-z]/, "need lowercase")
      .regex(/[A-Z]/, "need uppercase")
      .regex(/\d/, "need digit")
      .regex(/[^A-Za-z0-9]/, "need symbol"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

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

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:8000/api/v1";

const inputClass =
  "mt-1.5 w-full px-3.5 py-3 text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-xl bg-gray-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition";

function SignUpCard() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const Options = [
    {
      id: "username",
      label: "Username",
      type: "text",
      placeholder: "john_doe",
      autoComplete: "username",
    },
    {
      id: "email",
      label: "Email",
      type: "email",
      placeholder: "you@example.com",
      autoComplete: "email",
    },
  ];

  const strength = getLbl(formData.password);
  const passwordsMatch =
    formData.confirmPassword.length === 0 ||
    formData.password === formData.confirmPassword;

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    const parse = formSchema.safeParse(formData);
    if (!parse.success) {
      const errorMsg = parse.error.errors[0].message;
      setMsg({ type: "error", text: errorMsg });
      return;
    }

    try {
      setLoading(true);
      const { username, email, password } = parse.data;
      await signup({ username, email, password });

      setMsg({ type: "success", text: "Signup successful! Redirecting…" });
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Something went wrong";
      setMsg({
        type: "error",
        text: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    setGoogleLoading(true);
    window.location.href = `${API_BASE}/users/auth/google`;
  };

  return (
    <AuthSplitLayout>
      <div className="rounded-2xl border border-gray-200/80 bg-white/90 backdrop-blur-sm shadow-xl shadow-gray-200/50 p-8 sm:p-9">
          <div className="text-center mb-8">
            <p className="text-sm font-medium text-blue-600 mb-1">CodeSM</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Create an account
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Join to practice, compete, and learn
            </p>
          </div>

          {msg.text && (
            <div
              role={msg.type === "error" ? "alert" : "status"}
              className={`mb-5 flex items-start gap-3 rounded-xl px-4 py-3 text-sm ${
                msg.type === "error"
                  ? "border border-red-200 bg-red-50 text-red-800"
                  : "border border-emerald-200 bg-emerald-50 text-emerald-800"
              }`}
            >
              <span
                className={`mt-0.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
                  msg.type === "error" ? "bg-red-500" : "bg-emerald-500"
                }`}
              />
              <span>{msg.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {Options.map(({ id, label, type, placeholder, autoComplete }) => (
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
                  autoComplete={autoComplete}
                  required
                  className={inputClass}
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
                placeholder="••••••••"
                autoComplete="new-password"
                required
                className={inputClass}
              />
              {formData.password.length > 0 && (
                <div className="mt-2">
                  <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${strength.c} transition-all duration-300`}
                      style={{ width: `${strength.v}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 capitalize float-right mt-1">
                    {strength.t}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="new-password"
                required
                className={`${inputClass} ${
                  !passwordsMatch && formData.confirmPassword.length > 0
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                    : ""
                }`}
              />
              {!passwordsMatch && formData.confirmPassword.length > 0 && (
                <p className="mt-1.5 text-xs text-red-600">Passwords don&apos;t match</p>
              )}
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
              {loading ? "Creating account…" : "Create account"}
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

          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={googleLoading || loading}
            className={`w-full py-3 flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition ${
              googleLoading || loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <FcGoogle size={22} />
            {googleLoading ? "Redirecting…" : "Google"}
          </button>

          <p className="text-sm text-center text-gray-500 mt-8">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-700 hover:underline underline-offset-2"
            >
              Sign in
            </Link>
          </p>
      </div>
    </AuthSplitLayout>
  );
}

export default SignUpCard;
