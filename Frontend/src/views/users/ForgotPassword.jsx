import React, { useState } from "react";
import { forgotPassword } from "../../api/api.js";
import { Link } from "react-router-dom";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState({ type: "", message: "" });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: "", message: "" });

        try {
            const response = await forgotPassword(email);
            setStatus({ type: "success", message: response.data.message || "If an account with that email exists, a reset link has been sent." });
        } catch (err) {
            console.error(err);
            setStatus({
                type: "error",
                message: err.response?.data?.message || "Something went wrong. Please try again."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-8 bg-white shadow-2xl rounded-2xl mt-12 mb-12">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
                Reset Password
            </h2>
            <p className="text-center text-gray-500 mb-6 font-medium">
                Enter your email address and we'll send you a link to reset your password.
            </p>

            {status.message && (
                <div className={`p-4 rounded-lg mb-6 text-center ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {status.message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="you@example.com"
                        required
                        disabled={loading}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || !email}
                    className={`w-full py-3 px-6 text-white text-lg font-medium rounded-lg transition
            ${loading || !email
                            ? "bg-blue-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                >
                    {loading ? "Sending Link..." : "Send Reset Link"}
                </button>

                <div className="text-center mt-6">
                    <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                        ← Back to Login
                    </Link>
                </div>
            </form>
        </div>
    );
}

export default ForgotPassword;
