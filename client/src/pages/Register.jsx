import { useState } from "react";
import { apiUrl, isApiConfigured } from "../utils/api.js";

function Register({ onRegisterSuccess, onLoginClick }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        gender: "",
        password: "",
        confirmPassword: ""
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

        if (!formData.name.trim()) {
            setError("Please enter your name.");
            return;
        }

        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (!isApiConfigured) {
            setError("Online registration is not connected yet. Deploy the StudentMart API and set the VITE_API_URL repository variable.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                apiUrl("auth/register"),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: formData.name.trim(),
                        email: formData.email.trim(),
                        password: formData.password,
                        gender: formData.gender
                    })
                }
            );

            if (!(response.headers.get("content-type") || "").includes("application/json")) {
                throw new Error("The API address returned a web page instead of JSON. Check the VITE_API_URL setting.");
            }
            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Registration failed.");
                return;
            }

            setMessage("Account created successfully!");

            setFormData({
                name: "",
                email: "",
                gender: "",
                password: "",
                confirmPassword: ""
            });

            setTimeout(() => {
                onRegisterSuccess();
            }, 1200);

        } catch (error) {
            console.error("Registration Error:", error);
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
                    <h2><center>Sign Up</center></h2>
                    <p>
                        Join StudentMart and start buying & selling with students.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>

                    <div className="input-group">
                        <label htmlFor="name">Full Name</label>

                        <div className="input-wrapper">
                            <span className="input-icon">👤</span>

                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                autoComplete="name"
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group register-gender-group">
                        <label htmlFor="gender">Gender</label>
                        <select
                            id="gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Choose gender</option>
                            <option value="female">Female</option>
                            <option value="male">Male</option>
                            <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                    </div>

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
                        <label htmlFor="password">Password</label>

                        <div className="input-wrapper">
                            <span className="input-icon">🔒</span>

                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a password"
                                autoComplete="new-password"
                                minLength="8"
                                required
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>

                        <small>Password must contain at least 8 characters.</small>
                    </div>

                    <div className="input-group">
                        <label htmlFor="confirmPassword">
                            Confirm Password
                        </label>

                        <div className="input-wrapper">
                            <span className="input-icon">🔐</span>

                            <input
                                id="confirmPassword"
                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                autoComplete="new-password"
                                required
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowConfirmPassword(
                                        !showConfirmPassword
                                    )
                                }
                            >
                                {showConfirmPassword ? "Hide" : "Show"}
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
                        {loading ? "Creating account..." : "Create Account"}
                    </button>

                </form>

                <div className="auth-switch">
                    <span>Already have an account?</span>

                    <button
                        type="button"
                        onClick={onLoginClick}
                    >
                        Sign in
                    </button>
                </div>

            </div>

            <p className="auth-footer">
                © 2026 StudentMart · Built for students
            </p>

        </div>
    );
}

export default Register;
