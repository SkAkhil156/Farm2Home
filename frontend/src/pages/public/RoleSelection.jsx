
import { Link } from "react-router-dom";
import "./RoleSelection.css";
export default function RoleSelection() {
    return (
        <main className="welcome-page">
            <header className="welcome-header">
                <Link to="/" className="welcome-brand">
                    <span className="welcome-logo">🌱</span>
                    Farm<span>2</span>Home
                </Link>
                <span className="welcome-tagline">Grown with care. Delivered with trust.</span>
            </header>

            <section className="welcome-content">
                <div className="welcome-copy">
                    <span className="welcome-eyebrow">WELCOME TO FARM2HOME</span>
                    <h1>
                        Good food starts
                        <br />
                        <span>with good connections.</span>
                    </h1>
                    <p>
                        A simpler way for farmers to reach customers and for families
                        to discover fresh products directly from the farm.
                    </p>
                    <div className="welcome-points">
                        <span>✓ Direct farmer connection</span>
                        <span>✓ Fresh farm products</span>
                        <span>✓ A fairer marketplace</span>
                    </div>
                </div>

                <div className="role-panel">
                    <span className="role-panel-label">LET'S GET STARTED</span>
                    <h2>How would you like to continue?</h2>
                    <p className="role-panel-description">
                        Choose your account type to continue.
                    </p>

                    <Link to="/login/customer" className="role-option">
                        <span className="role-option-icon">🧺</span>
                        <span className="role-option-copy">
                            <strong>I'm a Customer</strong>
                            <small>Discover products and shop from farmers.</small>
                            <span className="role-register">
                                Sign in or create an account
                            </span>
                        </span>
                        <span className="role-arrow">→</span>
                    </Link>

                    <Link to="/login/farmer" className="role-option">
                        <span className="role-option-icon">🌾</span>
                        <span className="role-option-copy">
                            <strong>I'm a Farmer</strong>
                            <small>Sell your harvest and manage your products.</small>
                            <span className="role-register">
                                Sign in or register as a farmer
                            </span>
                        </span>
                        <span className="role-arrow">→</span>
                    </Link>

                    <div className="welcome-divider">
                        <span>OR</span>
                    </div>

                    <Link to="/shop" className="browse-link">
                        Browse products without signing in <span>↗</span>
                    </Link>
                </div>
            </section>

            <footer className="welcome-footer">
                <span>🌿 Growing together, from farm to home.</span>
                <span>© {new Date().getFullYear()} Farm2Home</span>
            </footer>
        </main>
    );
}
