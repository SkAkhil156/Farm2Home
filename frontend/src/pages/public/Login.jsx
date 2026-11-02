
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import "./Auth.css";
export default function Login() {
    const { role } = useParams();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const validRole = role === "farmer" || role === "customer";

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!validRole) {
            setError("Please select a valid account type.");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post("/auth/login", {
                email: email.trim(),
                password,
            });

            const { token, user } = response.data;

            if (!token || !user) {
                throw new Error("The server did not return the login details.");
            }

            if (user.role !== role) {
                setError(
                    `This account is registered as a ${user.role}. Please use the correct sign-in page.`
                );
                return;
            }

            localStorage.setItem("farm2home_token", token);
            localStorage.setItem("farm2home_user", JSON.stringify(user));

            if (user.role === "farmer") {
                navigate("/farmer/dashboard", { replace: true });
            } else {
                navigate("/shop", { replace: true });
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to sign in. Please check your details and try again."
            );
        } finally {
            setLoading(false);
        }
    }

    if (!validRole) {
        return (
            <main className="auth-page">
                <div className="auth-card">
                    <h2>Invalid account type</h2>
                    <Link to="/">Return to Farm2Home</Link>
                </div>
            </main>
        );
    }

    const isFarmer = role === "farmer";

    return (
        <main className="auth-page">
            <header className="auth-header">
                <Link to="/" className="auth-brand">
                    <span>🌱</span> Farm<span className="auth-brand-accent">2</span>Home
                </Link>
                <Link to="/" className="auth-back">← Back to home</Link>
            </header>

            <section className="auth-layout">
                <aside className="auth-visual">
                    <span className="auth-kicker">GROWN WITH CARE</span>
                    <h1>
                        {isFarmer
                            ? "Your harvest deserves a bigger market."
                            : "Fresh choices start with a better connection."}
                    </h1>
                    <p>
                        {isFarmer
                            ? "Manage your products and connect with customers looking for fresh farm produce."
                            : "Discover farm products and support the people who grow your food."}
                    </p>
                    <div className="auth-illustration">
                        {isFarmer ? "🌾 🌱 🚜" : "🥬 🥭 🧺"}
                    </div>
                    <div className="auth-promise">
                        <span>✓</span> Bringing farmers and homes closer
                    </div>
                </aside>

                <div className="auth-card">
                    <div className="auth-role-icon">
                        {isFarmer ? "🌾" : "🧺"}
                    </div>

                    <span className="auth-kicker">
                        {isFarmer ? "FARMER ACCOUNT" : "CUSTOMER ACCOUNT"}
                    </span>

                    <h2>Welcome back!</h2>
                    <p className="auth-subtitle">
                        Sign in to continue to your {role} account.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <label htmlFor="email">Email address</label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <label htmlFor="password">Password</label>
                        <div className="password-field">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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

                        {error && (
                            <p className="auth-error" role="alert">{error}</p>
                        )}

                        <button className="auth-submit" type="submit" disabled={loading}>
                            {loading ? "Signing in..." : "Sign in"}
                            {!loading && <span> →</span>}
                        </button>
                    </form>

                    <p className="auth-switch">
                        Don't have an account?{" "}
                        <Link to={`/register/${role}`}>Create account</Link>
                    </p>

                    <p className="auth-terms">
                        By continuing, you agree to use Farm2Home responsibly.
                    </p>
                </div>
            </section>
        </main>
    );
}
