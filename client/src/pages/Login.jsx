import { useState } from "react";
import { apiUrl, isApiConfigured } from "../utils/api.js";

function Login({ onRegisterClick }) {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");
        if (!isApiConfigured) {
            setError("Online login is not connected yet. Deploy the StudentMart API and set the VITE_API_URL repository variable.");
            return;
        }
        setLoading(true);

        try {
            const response = await fetch(
                apiUrl("auth/login"),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formData)
                }
            );

            if (!(response.headers.get("content-type") || "").includes("application/json")) {
                throw new Error("The API address returned a web page instead of JSON. Check the VITE_API_URL setting.");
            }
            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Login failed.");
                return;
            }

            localStorage.setItem("token", data.token);

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            setMessage("Login successful!");

            setTimeout(() => {
                window.location.reload();
            }, 700);

        } catch (error) {
            console.error("Login Error:", error);
            setError(error.message === "Failed to fetch" ? "Unable to connect to the StudentMart API. Confirm the backend is deployed and its URL is configured." : error.message || "Unable to connect to server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            <div className="auth-brand">
                <div className="brand-icon">S</div>

                <div>
                    <h1>Student<span>Mart</span></h1>
                    <p>Your campus marketplace</p>
                </div>
            </div>

            <div className="auth-card">

                <div className="auth-header">
                    <h2><center>Login</center></h2>

                    <p>
                        Sign in to continue to your StudentMart account.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>

                    <div className="input-group">
                        <label htmlFor="email">Email Address</label>

                        <div className="input-wrapper">
                            <span className="input-icon">✉</span>

                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                autoComplete="email"
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <div className="label-row">
                            <label htmlFor="password">
                                Password
                            </label>

                            <button
                                type="button"
                                className="forgot-button"
                                onClick={() =>
                                    setMessage(
                                        "Password recovery will be added soon."
                                    )
                                }
                            >
                                Forgot password?
                            </button>
                        </div>

                        <div className="input-wrapper">
                            <span className="input-icon">🔒</span>

                            <input
                                id="password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                required
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="alert error">
                            ⚠ {error}
                        </div>
                    )}

                    {message && (
                        <div className="alert success">
                            ✓ {message}
                        </div>
                    )}

                    <button
                        className="auth-button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>

                </form>

                <div className="divider">
                    <span>OR</span>
                </div>

                <div className="auth-switch">
                    <span>Don't have an account?</span>

                    <button
                        type="button"
                        onClick={onRegisterClick}
                    >
                        Create account
                    </button>
                </div>

            </div>

            <p className="auth-footer">
                © 2026 StudentMart · Built for students
            </p>

        </div>
    );
}

export default Login;
