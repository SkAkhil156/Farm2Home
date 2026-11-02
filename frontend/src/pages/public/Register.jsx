
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import "./Auth.css";
export default function Register() {
    const { role } = useParams();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
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

        if (password.length < 8) {
            setError("Your password must contain at least 8 characters.");
            return;
        }

        setLoading(true);

        try {
            await api.post("/auth/register", {
                name: name.trim(),
                email: email.trim(),
                password,
                role,
                ...(phone.trim() ? { phone: phone.trim() } : {}),
            });

            navigate(`/login/${role}`, {
                replace: true,
                state: { message: "Account created successfully. Please sign in." },
            });
        } catch (err) {
            const details = err.response?.data?.issues;
            const message =
                err.response?.data?.message ||
                (Array.isArray(details)
                    ? details.map((item) => item.message).join(" ")
                    : "") ||
                "Unable to create your account. Please check your details.";

            setError(message);
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
                    <span className="auth-kicker">GROW WITH FARM2HOME</span>
                    <h1>
                        {isFarmer
                            ? "Bring your farm to more customers."
                            : "Discover a fresher way to shop."}
                    </h1>
                    <p>
                        {isFarmer
                            ? "Create your account to start listing your farm produce."
                            : "Join Farm2Home to discover products from local farmers."}
                    </p>
                    <div className="auth-illustration">
                        {isFarmer ? "🌱 🌾 🚜" : "🥬 🥭 🧺"}
                    </div>
                    <div className="auth-promise">
                        <span>✓</span> A simpler connection from farm to home
                    </div>
                </aside>

                <div className="auth-card">
                    <div className="auth-role-icon">
                        {isFarmer ? "🌾" : "🧺"}
                    </div>

                    <span className="auth-kicker">
                        {isFarmer ? "FARMER ACCOUNT" : "CUSTOMER ACCOUNT"}
                    </span>

                    <h2>Create account</h2>
                    <p className="auth-subtitle">
                        Join Farm2Home as a {role}.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <label htmlFor="name">Full name</label>
                        <input
                            id="name"
                            autoComplete="name"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            minLength={2}
                            maxLength={80}
                            required
                        />

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

                        <label htmlFor="phone">Phone number (optional)</label>
                        <input
                            id="phone"
                            type="tel"
                            autoComplete="tel"
                            placeholder="Enter your phone number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />

                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            placeholder="At least 8 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength={8}
                            required
                        />

                        {error && (
                            <p className="auth-error" role="alert">{error}</p>
                        )}

                        <button className="auth-submit" type="submit" disabled={loading}>
                            {loading ? "Creating account..." : "Create account"}
                            {!loading && <span> →</span>}
                        </button>
                    </form>

                    <p className="auth-switch">
                        Already registered?{" "}
                        <Link to={`/login/${role}`}>Sign in</Link>
                    </p>
                </div>
            </section>
        </main>
    );
}
