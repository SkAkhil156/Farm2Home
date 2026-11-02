
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import "./MyProducts.css";

function extractProducts(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.products)) return data.products;
    if (Array.isArray(data?.data)) return data.data;
    return [];
}

export default function MyProducts() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const loadProducts = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await api.get("/products/my-products");
            setProducts(extractProducts(response.data));
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "We couldn't load your products. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const activeCount = products.filter(
        (product) => product.isActive !== false
    ).length;

    const inactiveCount = products.length - activeCount;

    const filteredProducts = products.filter((product) => {
        const query = search.trim().toLowerCase();

        const matchesSearch =
            (product.name || "").toLowerCase().includes(query) ||
            (product.category || "").toLowerCase().includes(query) ||
            (product.variety || "").toLowerCase().includes(query);

        const matchesFilter =
            filter === "all" ||
            (filter === "active" && product.isActive !== false) ||
            (filter === "inactive" && product.isActive === false);

        return matchesSearch && matchesFilter;
    });

    async function toggleAvailability(product) {
        const currentlyActive = product.isActive !== false;
        const action = currentlyActive ? "deactivate" : "activate";

        setBusyId(product._id);
        setError("");
        setMessage("");

        try {
            await api.patch(`/products/${product._id}`, {
                isActive: !currentlyActive,
            });

            setProducts((current) =>
                current.map((item) =>
                    item._id === product._id
                        ? { ...item, isActive: !currentlyActive }
                        : item
                )
            );

            setMessage(
                `${product.name} is now ${currentlyActive ? "unavailable" : "active"
                }.`
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                `Unable to ${action} this product. Please try again.`
            );
        } finally {
            setBusyId(null);
        }
    }

    async function deleteProduct(product) {
        const confirmed = window.confirm(
            `Delete "${product.name}" permanently? This action cannot be undone.`
        );

        if (!confirmed) return;

        setBusyId(product._id);
        setError("");
        setMessage("");

        try {
            await api.delete(`/products/${product._id}`);

            setProducts((current) =>
                current.filter((item) => item._id !== product._id)
            );

            setMessage(`${product.name} was deleted successfully.`);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to delete this product. Please try again."
            );
        } finally {
            setBusyId(null);
        }
    }

    return (
        <main className="my-products-page">
            <header className="products-header">
                <div>
                    <p className="products-eyebrow">FARMER WORKSPACE</p>
                    <h1>My Products</h1>
                    <p className="products-subtitle">
                        Manage your listings, prices and product availability.
                    </p>
                </div>

                <Link className="products-add-button" to="/farmer/products/add">
                    + Add product
                </Link>
            </header>

            <section className="products-summary">
                <article>
                    <span>Total products</span>
                    <strong>{products.length}</strong>
                </article>
                <article>
                    <span>Active listings</span>
                    <strong>{activeCount}</strong>
                </article>
                <article>
                    <span>Unavailable listings</span>
                    <strong>{inactiveCount}</strong>
                </article>
            </section>

            {message && (
                <div className="products-success" role="status">
                    {message}
                    <button onClick={() => setMessage("")} aria-label="Dismiss message">
                        ×
                    </button>
                </div>
            )}

            {error && (
                <div className="products-error" role="alert">
                    {error}
                    <button onClick={() => setError("")} aria-label="Dismiss error">
                        ×
                    </button>
                </div>
            )}

            <section className="products-panel">
                <div className="products-toolbar">
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search your products..."
                        aria-label="Search products"
                    />

                    <select
                        value={filter}
                        onChange={(event) => setFilter(event.target.value)}
                        aria-label="Filter products by status"
                    >
                        <option value="all">All products</option>
                        <option value="active">Active</option>
                        <option value="inactive">Unavailable</option>
                    </select>

                    <button
                        type="button"
                        className="products-refresh"
                        onClick={loadProducts}
                        disabled={loading}
                    >
                        {loading ? "Loading..." : "↻ Refresh"}
                    </button>
                </div>

                {loading ? (
                    <div className="products-empty">
                        <span>🌱</span>
                        <h2>Loading your products</h2>
                        <p>Please wait while we retrieve your listings.</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="products-empty">
                        <span>🌾</span>
                        <h2>
                            {products.length === 0
                                ? "Your first listing starts here"
                                : "No matching products"}
                        </h2>
                        <p>
                            {products.length === 0
                                ? "Add your farm produce so customers can discover it."
                                : "Try a different search term or status filter."}
                        </p>
                        {products.length === 0 && (
                            <Link className="products-add-button" to="/farmer/products/add">
                                Add your first product
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="products-table-wrap">
                        <table className="products-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredProducts.map((product) => {
                                    const isActive = product.isActive !== false;
                                    const isBusy = busyId === product._id;

                                    return (
                                        <tr key={product._id}>
                                            <td>
                                                <div className="products-product-cell">
                                                    {product.imageUrl ? (
                                                        <img
                                                            src={product.imageUrl}
                                                            alt={product.name}
                                                        />
                                                    ) : (
                                                        <div className="products-image-placeholder">
                                                            🌿
                                                        </div>
                                                    )}

                                                    <div>
                                                        <strong>{product.name}</strong>
                                                        <span>
                                                            {product.category || "Farm product"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="products-price">
                                                ₹{Number(product.price || 0).toLocaleString("en-IN")}
                                                <span> / {product.unit || "unit"}</span>
                                            </td>

                                            <td>
                                                {product.quantity ?? "—"}
                                                {product.unit ? ` ${product.unit}` : ""}
                                            </td>

                                            <td>
                                                <span
                                                    className={`products-status ${isActive ? "is-active" : "is-inactive"
                                                        }`}
                                                >
                                                    {isActive ? "Active" : "Unavailable"}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="products-actions">
                                                    <Link
                                                        to={`/farmer/products/edit/${product._id}`}
                                                        className="products-edit-button"
                                                    >
                                                        Edit
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        disabled={isBusy}
                                                        onClick={() => toggleAvailability(product)}
                                                    >
                                                        {isBusy
                                                            ? "Please wait..."
                                                            : isActive
                                                                ? "Deactivate"
                                                                : "Activate"}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="products-delete-button"
                                                        disabled={isBusy}
                                                        onClick={() => deleteProduct(product)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    );
}
