
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "./FarmerDashboard.css";

export default function FarmerDashboard() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        try {
            const savedUser = localStorage.getItem("farm2home_user");

            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
        } catch {
            setUser(null);
        }

        async function loadProducts() {
            try {
                const response = await api.get("/products/my-products");
                const data = response.data;

                const items = Array.isArray(data)
                    ? data
                    : data.products || data.data || [];

                setProducts(items);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load your products. Please try again."
                );
            } finally {
                setLoading(false);
            }
        }

        loadProducts();
    }, []);

    function handleLogout() {
        localStorage.removeItem("farm2home_token");
        localStorage.removeItem("farm2home_user");
        navigate("/", { replace: true });
    }

    const activeProducts = products.filter(
        (product) => product.isActive !== false
    );

    const verificationStatus = user?.isVerified
        ? "Verified"
        : "Verification pending";

    return (
        <div className="farmer-dashboard">
            <aside className="farmer-sidebar">
                <Link to="/farmer/dashboard" className="farmer-brand">
                    🌱 Farm2Home
                </Link>

                <p className="sidebar-label">FARMER WORKSPACE</p>

                <nav className="farmer-nav">
                    <Link className="nav-item active" to="/farmer/dashboard">
                        <span>▦</span> Dashboard
                    </Link>

                    <Link className="nav-item" to="/farmer/products">
                        <span>▤</span> My Products
                    </Link>

                    <Link className="nav-item" to="/farmer/products/add">
                        <span>＋</span> Add Product
                    </Link>

                    <Link className="nav-item" to="/farmer/orders">
                        <span>□</span> Orders
                    </Link>

                    <Link className="nav-item" to="/farmer/profile">
                        <span>♙</span> My Profile
                    </Link>
                </nav>

                <button
                    className="farmer-logout"
                    onClick={handleLogout}
                    type="button"
                >
                    ↪ Sign out
                </button>
            </aside>

            <main className="farmer-main">
                <header className="farmer-topbar">
                    <div>
                        <p className="eyebrow">FARMER PORTAL</p>
                        <h1>Dashboard</h1>
                    </div>

                    <div className="farmer-account">
                        <div className="farmer-avatar">
                            {(user?.name || "F").charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <strong>{user?.name || "Farmer"}</strong>
                            <span>{verificationStatus}</span>
                        </div>
                    </div>
                </header>

                <section className="farmer-welcome">
                    <div>
                        <p className="eyebrow">YOUR FARM, YOUR BUSINESS</p>
                        <h2>Welcome back, {user?.name || "Farmer"}! 🌾</h2>
                        <p>
                            Manage your produce and keep your Farm2Home listings up to date.
                        </p>
                        <Link className="primary-action" to="/farmer/products/add">
                            + Add a new product
                        </Link>
                    </div>
                    <div className="welcome-illustration" aria-hidden="true">
                        🌱 🌾 🌿
                    </div>
                </section>

                <section className="farmer-stats">
                    <article className="stat-card">
                        <span className="stat-icon">▤</span>
                        <p>Total products</p>
                        <h3>{loading ? "…" : products.length}</h3>
                    </article>

                    <article className="stat-card">
                        <span className="stat-icon">✓</span>
                        <p>Active listings</p>
                        <h3>{loading ? "…" : activeProducts.length}</h3>
                    </article>

                    <article className="stat-card">
                        <span className="stat-icon">♙</span>
                        <p>Account status</p>
                        <h3 className="status-value">
                            {user?.isVerified ? "Verified" : "Pending"}
                        </h3>
                    </article>
                </section>

                <section className="farmer-section">
                    <div className="section-heading">
                        <div>
                            <h2>Your recent products</h2>
                            <p>Manage the produce you have listed for customers.</p>
                        </div>
                        <Link to="/farmer/products">View all →</Link>
                    </div>

                    {loading && <p className="dashboard-message">Loading products…</p>}

                    {!loading && error && (
                        <p className="dashboard-error" role="alert">{error}</p>
                    )}

                    {!loading && !error && products.length === 0 && (
                        <div className="empty-products">
                            <span>🌾</span>
                            <h3>Your marketplace journey starts here</h3>
                            <p>You haven't listed any products yet.</p>
                            <Link className="primary-action" to="/farmer/products/add">
                                Add your first product
                            </Link>
                        </div>
                    )}

                    {!loading && !error && products.length > 0 && (
                        <div className="farmer-product-list">
                            {products.slice(0, 5).map((product) => (
                                <article className="farmer-product-row" key={product._id}>
                                    {product.imageUrl ? (
                                        <img src={product.imageUrl} alt={product.name} />
                                    ) : (
                                        <div className="product-placeholder">🌿</div>
                                    )}

                                    <div className="product-info">
                                        <strong>{product.name}</strong>
                                        <span>{product.category || "Farm product"}</span>
                                    </div>

                                    <strong className="product-price">
                                        ₹{Number(product.price || 0).toLocaleString("en-IN")}
                                    </strong>

                                    <span
                                        className={
                                            product.isActive === false
                                                ? "product-status inactive"
                                                : "product-status"
                                        }
                                    >
                                        {product.isActive === false ? "Inactive" : "Active"}
                                    </span>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                <section className="farmer-section quick-actions">
                    <h2>Quick actions</h2>
                    <div className="quick-action-grid">
                        <Link to="/farmer/products/add">
                            <span>＋</span>
                            <strong>Add product</strong>
                            <small>List new farm produce</small>
                        </Link>

                        <Link to="/farmer/products">
                            <span>▤</span>
                            <strong>Manage products</strong>
                            <small>Review your listings</small>
                        </Link>

                        <Link to="/farmer/profile">
                            <span>♙</span>
                            <strong>My profile</strong>
                            <small>Review your account details</small>
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
}
