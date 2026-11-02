
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("farm2home_user") || "null"
    );

    const handleLogout = () => {
        localStorage.removeItem("farm2home_token");
        localStorage.removeItem("farm2home_user");
        navigate("/admin/login");
    };

    if (!user || user.role !== "admin") {
        return (
            <div style={{ padding: "30px" }}>
                <h2>Access denied</h2>
                <p>Please sign in with an administrator account.</p>
                <button onClick={() => navigate("/admin/login")}>
                    Go to Admin Login
                </button>
            </div>
        );
    }

    const sections = [
        { title: "Manage Farmers", description: "View and manage farmer accounts." },
        { title: "Manage Customers", description: "View and manage customer accounts." },
        { title: "Manage Products", description: "Review products listed on Farm2Home." },
        { title: "Manage Orders", description: "Review and manage customer orders." },
    ];

    return (
        <div style={styles.page}>
            <header style={styles.header}>
                <div>
                    <h1>Farm2Home Admin</h1>
                    <p>Welcome, {user.name || "Administrator"}</p>
                </div>
                <button onClick={handleLogout} style={styles.logout}>
                    Logout
                </button>
            </header>

            <main style={styles.main}>
                <h2>Admin Dashboard</h2>
                <p>Manage your marketplace from one place.</p>

                <div style={styles.grid}>
                    {sections.map((section) => (
                        <div key={section.title} style={styles.card}>
                            <h3>{section.title}</h3>
                            <p>{section.description}</p>
                            <span style={styles.status}>Module setup pending</span>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        background: "#f4f7f5",
        fontFamily: "Arial, sans-serif",
        color: "#24352b",
    },
    header: {
        background: "#207344",
        color: "white",
        padding: "22px 5%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "16px",
    },
    main: {
        padding: "30px 5%",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "20px",
        marginTop: "25px",
    },
    card: {
        background: "white",
        padding: "22px",
        borderRadius: "12px",
        boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
    },
    status: {
        color: "#647568",
        fontSize: "13px",
    },
    logout: {
        padding: "10px 18px",
        border: "none",
        borderRadius: "7px",
        cursor: "pointer",
        fontWeight: "bold",
    },
};

export default AdminDashboard;
