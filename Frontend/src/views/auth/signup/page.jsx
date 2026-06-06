import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import z from "zod";
import { signup } from "@/api/api";
import { FcGoogle } from "react-icons/fc";
import AuthSplitLayout from "../page";
import { GoogleAuth } from "@/components/auth/google-auth";

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

const inputClass = "form-input mt-1.5";

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


  return (
    <AuthSplitLayout>
      <div className="rounded-md border border-hairline bg-canvas p-8 sm:p-10 shadow-xs">
          <div className="text-center mb-8">
            <p className="font-caption-mono text-link mb-2">CodeSM</p>
            <h1 className="text-2xl font-bold text-ink tracking-tight">
              Create an account
            </h1>
            <p className="mt-2 text-sm text-body">
              Join to practice, compete, and learn
            </p>
          </div>

          {msg.text && (
            <div
              role={msg.type === "error" ? "alert" : "status"}
              className={`mb-5 flex items-start gap-2.5 rounded-sm px-4 py-3 text-sm ${
                msg.type === "error"
                  ? "border border-rose-500/15 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  : "border border-emerald-500/15 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              <span
                className={`mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
                  msg.type === "error" ? "bg-rose-500" : "bg-emerald-500"
                }`}
              />
              <span>{msg.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {Options.map(({ id, label, type, placeholder, autoComplete }) => (
              <div key={id}>
                <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-body">
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
                  spellCheck={false}
                  required
                  className={inputClass}
                />
              </div>
            ))}

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-body">
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
                  <div className="h-1.5 rounded-full bg-canvas-soft-2 overflow-hidden border border-hairline/20">
                    <div
                      className={`h-full rounded-full ${strength.c} transition-all duration-300`}
                      style={{ width: `${strength.v}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-body capitalize float-right mt-1">
                    {strength.t}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-body">
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
                    ? "border-rose-500 focus:border-rose-600 focus:ring-rose-500/20"
                    : ""
                }`}
              />
              {!passwordsMatch && formData.confirmPassword.length > 0 && (
                <p className="mt-1.5 text-xs text-rose-600">Passwords don&apos;t match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className={`w-full h-10 mt-2 btn-primary font-semibold text-sm rounded-sm flex items-center justify-center cursor-pointer ${
                loading || googleLoading ? "opacity-50 cursor-not-allowed shadow-none" : ""
              }`}
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <span className="w-full border-t border-hairline" />
            </div>
            <div className="relative flex justify-center text-[10px] font-semibold uppercase tracking-wider">
              <span className="bg-canvas px-3 text-mute">Or continue with</span>
            </div>
          </div>

          <GoogleAuth
            className="w-full"
            label="Google"
            onLoadingChange={setGoogleLoading}
            disabled={loading}
          />

          <p className="text-sm text-center text-body mt-8">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-link hover:text-link-deep hover:underline underline-offset-2"
            >
              Sign in
            </Link>
          </p>
      </div>
    </AuthSplitLayout>
  );
}

export default SignUpCard;
