
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRole }) {
    const location = useLocation();

    const token = localStorage.getItem("farm2home_token");
    let user = null;

    try {
        user = JSON.parse(localStorage.getItem("farm2home_user"));
    } catch {
        user = null;
    }

    // Require a valid-looking local login session.
    if (!token || !user || !user.role) {
        return <Navigate to="/" replace state={{ from: location }} />;
    }

    // Prevent navigation to another role's pages.
    if (allowedRole && user.role !== allowedRole) {
        if (user.role === "farmer") {
            return <Navigate to="/farmer/dashboard" replace />;
        }

        if (user.role === "customer") {
            return <Navigate to="/shop" replace />;
        }

        return <Navigate to="/" replace />;
    }

    return children;
}
