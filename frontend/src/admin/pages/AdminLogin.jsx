
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await axios.post(
                "http://localhost:5000/api/auth/login",
                { email, password }
            );

            const { token, user } = response.data;

            if (user.role !== "admin") {
                setError("Access denied. Admin credentials are required.");
                return;
            }

            localStorage.setItem("farm2home_token", token);
            localStorage.setItem("farm2home_user", JSON.stringify(user));

            navigate("/admin/dashboard");
        } catch (err) {
            setError(
                err.response?.data?.message || "Login failed. Check your credentials."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <form onSubmit={handleLogin} style={styles.card}>
                <h1 style={styles.title}>Farm2Home</h1>
                <h2 style={styles.heading}>Administrator Login</h2>
                <p style={styles.subtitle}>
                    Sign in to manage the Farm2Home platform.
                </p>

                {error && <p style={styles.error}>{error}</p>}

                <label style={styles.label}>Admin Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter admin email"
                    autoComplete="username"
                    required
                    style={styles.input}
                />

                <label style={styles.label}>Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    autoComplete="current-password"
                    required
                    style={styles.input}
                />

                <button type="submit" disabled={loading} style={styles.button}>
                    {loading ? "Signing in..." : "Sign In as Admin"}
                </button>
            </form>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background: "linear-gradient(135deg, #edf7ed, #e2f1e8)",
        fontFamily: "Arial, sans-serif",
    },
    card: {
        width: "100%",
        maxWidth: "420px",
        padding: "32px",
        borderRadius: "16px",
        background: "#ffffff",
        boxShadow: "0 10px 35px rgba(0,0,0,0.10)",
    },
    title: {
        color: "#207344",
        textAlign: "center",
        marginBottom: "8px",
    },
    heading: {
        textAlign: "center",
        color: "#24352b",
    },
    subtitle: {
        textAlign: "center",
        color: "#66736a",
        marginBottom: "24px",
    },
    label: {
        display: "block",
        marginBottom: "8px",
        fontWeight: "bold",
    },
    input: {
        width: "100%",
        boxSizing: "border-box",
        padding: "12px",
        marginBottom: "18px",
        border: "1px solid #ccd7ce",
        borderRadius: "8px",
        fontSize: "15px",
    },
    button: {
        width: "100%",
        padding: "13px",
        border: "none",
        borderRadius: "8px",
        background: "#207344",
        color: "#ffffff",
        fontWeight: "bold",
        fontSize: "16px",
        cursor: "pointer",
    },
    error: {
        padding: "10px",
        borderRadius: "6px",
        background: "#fdecec",
        color: "#b42318",
    },
};

export default AdminLogin;
