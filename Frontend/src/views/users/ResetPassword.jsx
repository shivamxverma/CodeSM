import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { resetPassword } from "../../api/api.js";

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    });
    const [status, setStatus] = useState({ type: "", message: "" });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setStatus({ type: "error", message: "Passwords do not match." });
            return;
        }
        if (formData.password.length < 8) {
            setStatus({ type: "error", message: "Password must be at least 8 characters long." });
            return;
        }

        setLoading(true);
        setStatus({ type: "", message: "" });

        try {
            const response = await resetPassword(token, formData.password, formData.confirmPassword);
            setStatus({ type: "success", message: response.data.message || "Password reset successfully! Redirecting to login..." });

            setTimeout(() => {
                navigate("/login");
            }, 2500);

        } catch (err) {
            console.error(err);
            setStatus({
                type: "error",
                message: err.response?.data?.message || "Failed to reset password. The link might be expired."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-8 bg-white shadow-2xl rounded-2xl mt-12 mb-12">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
                Create New Password
            </h2>

            {status.message && (
                <div className={`p-4 rounded-lg mb-6 text-center ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {status.message}
                </div>
            )}

            {status.type !== 'success' && (
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            placeholder="••••••••"
                            required
                            disabled={loading}
                            minLength="8"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            placeholder="••••••••"
                            required
                            disabled={loading}
                            minLength="8"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !formData.password || !formData.confirmPassword}
                        className={`w-full py-3 px-6 text-white text-lg font-medium rounded-lg transition mt-4
              ${loading || !formData.password || !formData.confirmPassword
                                ? "bg-blue-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                            }`}
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>
            )}

            {status.type === 'error' && (
                <div className="text-center mt-6 text-sm text-gray-500">
                    Need a new link? <Link to="/forgot-password" className="text-blue-600 hover:text-blue-800 font-medium">Click here</Link>
                </div>
            )}
        </div>
    );
}

export default ResetPassword;
