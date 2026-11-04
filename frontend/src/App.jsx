
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// ================= PUBLIC PAGES =================
import RoleSelection from "./pages/public/RoleSelection";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";

// ================= CUSTOMER PAGES =================
import Shop from "./pages/customer/Shop";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";

// ================= FARMER PAGES =================
import FarmerDashboard from "./pages/farmer/FarmerDashboard";
import MyProducts from "./pages/farmer/MyProducts";
import AddProduct from "./pages/farmer/AddProduct";
import EditProduct from "./pages/farmer/EditProduct";
import FarmerOrders from "./pages/farmer/FarmerOrders";

// ================= ADMIN PAGES =================
import AdminLogin from "./admin/pages/AdminLogin";
import AdminDashboard from "./admin/pages/AdminDashboard";

// ================= ROUTE PROTECTION =================
import ProtectedRoute from "./routes/ProtectedRoute";

// ================= TEMPORARY PAGE =================
function ComingSoon({ title }) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeContent: "center",
        textAlign: "center",
        padding: 24,
        fontFamily: "Arial, sans-serif",
        color: "#245438",
        background: "#faf8ef",
      }}
    >
      <h1>🌱 Farm2Home</h1>
      <h2>{title}</h2>
      <p>This page is under development.</p>

      <a href="/" style={{ color: "#38764a" }}>
        ← Back to home
      </a>
    </main>
  );
}

// ================= MAIN APP =================
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= PUBLIC ROUTES ================= */}

        <Route
          path="/"
          element={<RoleSelection />}
        />

        <Route
          path="/login/:role"
          element={<Login />}
        />

        <Route
          path="/register/:role"
          element={<Register />}
        />

        {/* ================= CUSTOMER ROUTES ================= */}

        {/* Public product browsing */}
        <Route
          path="/shop"
          element={<Shop />}
        />

        {/* Customer shopping cart */}
        <Route
          path="/customer/cart"
          element={
            <ProtectedRoute allowedRole="customer">
              <Cart />
            </ProtectedRoute>
          }
        />

        {/* Customer checkout */}
        <Route
          path="/customer/checkout"
          element={
            <ProtectedRoute allowedRole="customer">
              <Checkout />
            </ProtectedRoute>
          }
        />

        {/* Customer order history - upcoming implementation */}
        <Route
          path="/customer/orders"
          element={
            <ProtectedRoute allowedRole="customer">
              <ComingSoon title="My Orders" />
            </ProtectedRoute>
          }
        />

        {/* ================= FARMER ROUTES ================= */}

        <Route
          path="/farmer/dashboard"
          element={
            <ProtectedRoute allowedRole="farmer">
              <FarmerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/farmer/products"
          element={
            <ProtectedRoute allowedRole="farmer">
              <MyProducts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/farmer/products/add"
          element={
            <ProtectedRoute allowedRole="farmer">
              <AddProduct />
            </ProtectedRoute>
          }
        />

        <Route
          path="/farmer/products/edit/:id"
          element={
            <ProtectedRoute allowedRole="farmer">
              <EditProduct />
            </ProtectedRoute>
          }
        />

        <Route
          path="/farmer/orders"
          element={
            <ProtectedRoute allowedRole="farmer">
              <FarmerOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/farmer/profile"
          element={
            <ProtectedRoute allowedRole="farmer">
              <ComingSoon title="Farmer Profile" />
            </ProtectedRoute>
          }
        />

        {/* ================= ADMIN ROUTES ================= */}

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ================= UNKNOWN ROUTES ================= */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
