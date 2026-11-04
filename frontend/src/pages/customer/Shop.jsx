import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "./Shop.css";

const categories = [
    { label: "All Products", value: "all", icon: "🌿" },
    { label: "Grains", value: "grains", icon: "🌾" },
    { label: "Pulses", value: "pulses", icon: "🫘" },
    { label: "Vegetables", value: "vegetables", icon: "🥬" },
    { label: "Fruits", value: "fruits", icon: "🥭" },
    { label: "Dairy", value: "dairy", icon: "🥛" },
    { label: "Spices", value: "spices", icon: "🌶️" },
    { label: "Other", value: "other", icon: "🧺" },
];

function getProducts(responseData) {
    if (Array.isArray(responseData)) return responseData;
    if (Array.isArray(responseData?.products)) return responseData.products;
    if (Array.isArray(responseData?.data)) return responseData.data;
    return [];
}

function getFarmerName(product) {
    if (typeof product.farmer === "string") {
        return "Farm2Home Farmer";
    }

    return (
        product.farmer?.name ||
        product.farmerName ||
        product.farmer_name ||
        "Farm2Home Farmer"
    );
}

function Shop() {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [addingProductId, setAddingProductId] = useState(null);
    const [cartMessage, setCartMessage] = useState("");
    const [cartError, setCartError] = useState("");

    useEffect(() => {
        let active = true;

        async function fetchProducts() {
            try {
                setLoading(true);
                setError("");

                const response = await api.get("/products", {
                    params: {
                        page: 1,
                        limit: 50,
                    },
                });

                if (active) {
                    setProducts(getProducts(response.data));
                }
            } catch (err) {
                if (active) {
                    setError(
                        err.response?.data?.message ||
                        "Unable to load products. Please check your backend and try again."
                    );
                }
            } finally {
                if (active) setLoading(false);
            }
        }

        fetchProducts();

        return () => {
            active = false;
        };
    }, []);

    const filteredProducts = useMemo(() => {
        const query = search.trim().toLowerCase();

        return products.filter((product) => {
            const matchesSearch =
                !query ||
                [
                    product.name,
                    product.description,
                    product.category,
                    getFarmerName(product),
                ].some((value) =>
                    String(value || "").toLowerCase().includes(query)
                );

            const matchesCategory =
                selectedCategory === "all" ||
                product.category === selectedCategory;

            return (
                matchesSearch &&
                matchesCategory &&
                product.isActive !== false
            );
        });
    }, [products, search, selectedCategory]);

    function logout() {
        localStorage.removeItem("farm2home_token");
        localStorage.removeItem("farm2home_user");
        navigate("/", { replace: true });
    }

    async function handleAddToCart(product) {
        const productId = product._id || product.id;

        if (!productId) {
            setCartError("This product does not have a valid product ID.");
            setCartMessage("");
            return;
        }

        try {
            setAddingProductId(productId);
            setCartMessage("");
            setCartError("");

            const response = await api.post("/cart/items", {
                productId,
                quantity: 1,
            });

            setCartMessage(
                response.data?.message ||
                `${product.name} added to your cart successfully!`
            );
        } catch (err) {
            if (err.response?.status === 401) {
                setCartError("Please log in as a customer to add products to your cart.");
            } else if (err.response?.status === 403) {
                setCartError("Only customer accounts can add products to the cart.");
            } else {
                setCartError(
                    err.response?.data?.message ||
                    "Unable to add this product to your cart. Please try again."
                );
            }
        } finally {
            setAddingProductId(null);
        }
    }

    return (
        <div className="shop-page">
            <header className="shop-header">
                <Link to="/" className="shop-brand">
                    <span className="brand-icon">🌱</span>
                    <span>
                        Farm<span className="brand-highlight">2</span>Home
                    </span>
                </Link>

                <div className="shop-header-right">
                    <span className="header-tagline">Fresh from the farm</span>
                    <button className="logout-button" onClick={logout}>
                        Log out
                    </button>
                </div>
            </header>

            <main>
                <section className="shop-hero">
                    <div className="hero-content">
                        <span className="hero-eyebrow">🌾 GROWN WITH CARE</span>
                        <h1>
                            Fresh from farmers.
                            <br />
                            Delivered to you.
                        </h1>
                        <p>
                            Discover fresh farm produce and support local farmers
                            with every purchase.
                        </p>

                        <div className="shop-search">
                            <span>🔎</span>
                            <input
                                type="search"
                                placeholder="Search rice, mangoes, vegetables..."
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                aria-label="Search products"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    aria-label="Clear search"
                                    type="button"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="hero-decoration" aria-hidden="true">
                        <span>🌾</span>
                        <span>🥬</span>
                        <span>🥭</span>
                    </div>
                </section>

                <section className="shop-content">
                    <div className="section-heading">
                        <div>
                            <span className="section-kicker">FROM OUR FARMS</span>
                            <h2>Explore fresh produce</h2>
                            <p>
                                Good food, fair prices, and a direct connection to farmers.
                            </p>
                        </div>

                        <span className="product-count">
                            {filteredProducts.length} products
                        </span>
                    </div>

                    <div className="category-list">
                        {categories.map((category) => (
                            <button
                                key={category.value}
                                type="button"
                                className={`category-button ${selectedCategory === category.value ? "active" : ""
                                    }`}
                                onClick={() => setSelectedCategory(category.value)}
                            >
                                <span>{category.icon}</span>
                                {category.label}
                            </button>
                        ))}
                    </div>

                    {cartMessage && (
                        <div className="cart-feedback cart-success" role="status">
                            {cartMessage}
                        </div>
                    )}

                    {cartError && (
                        <div className="cart-feedback cart-error" role="alert">
                            {cartError}
                        </div>
                    )}

                    {loading && (
                        <div className="shop-message">
                            <div className="loading-spinner" />
                            <p>Gathering fresh products...</p>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="shop-message error-message">
                            <span>⚠️</span>
                            <h3>Couldn't load products</h3>
                            <p>{error}</p>
                            <button onClick={() => window.location.reload()} type="button">
                                Try again
                            </button>
                        </div>
                    )}

                    {!loading && !error && filteredProducts.length === 0 && (
                        <div className="shop-message">
                            <span className="empty-icon">🧺</span>
                            <h3>No products found</h3>
                            <p>
                                Try another search or choose a different category.
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch("");
                                    setSelectedCategory("all");
                                }}
                            >
                                Show all products
                            </button>
                        </div>
                    )}

                    {!loading && !error && filteredProducts.length > 0 && (
                        <div className="product-grid">
                            {filteredProducts.map((product) => {
                                const productId = product._id || product.id;
                                const stock = Number(product.quantity);
                                const isOutOfStock =
                                    !Number.isFinite(stock) || stock <= 0;
                                const isAdding = addingProductId === productId;

                                return (
                                    <article
                                        className="product-card"
                                        key={productId}
                                    >
                                        <div className="product-image-wrap">
                                            {product.imageUrl ? (
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className="product-image"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="product-image-placeholder">
                                                    {product.category === "fruits"
                                                        ? "🥭"
                                                        : product.category === "vegetables"
                                                            ? "🥬"
                                                            : product.category === "grains"
                                                                ? "🌾"
                                                                : product.category === "pulses"
                                                                    ? "🫘"
                                                                    : product.category === "dairy"
                                                                        ? "🥛"
                                                                        : product.category === "spices"
                                                                            ? "🌶️"
                                                                            : "🌱"}
                                                </div>
                                            )}
                                            <span className="organic-label">
                                                Farm fresh
                                            </span>
                                        </div>

                                        <div className="product-details">
                                            <span className="product-category">
                                                {product.category || "Farm produce"}
                                            </span>

                                            <h3>{product.name}</h3>

                                            <p className="farmer-name">
                                                👨‍🌾 {getFarmerName(product)}
                                            </p>

                                            <div className="product-price-row">
                                                <div>
                                                    <span className="product-price">
                                                        ₹
                                                        {Number(product.price).toLocaleString(
                                                            "en-IN",
                                                            {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            }
                                                        )}
                                                    </span>
                                                    <span className="product-unit">
                                                        / {product.unit || "unit"}
                                                    </span>
                                                </div>

                                                <span
                                                    className={`stock-label ${isOutOfStock ? "out-of-stock-label" : ""
                                                        }`}
                                                >
                                                    {isOutOfStock
                                                        ? "Out of stock"
                                                        : `${stock} ${product.unit || "units"} available`}
                                                </span>
                                            </div>

                                            {product.description && (
                                                <p className="product-description">
                                                    {product.description}
                                                </p>
                                            )}

                                            <div className="product-actions">
                                                <button
                                                    className="add-cart-button"
                                                    type="button"
                                                    onClick={() =>
                                                        handleAddToCart(product)
                                                    }
                                                    disabled={isOutOfStock || isAdding}
                                                >
                                                    {isAdding
                                                        ? "Adding..."
                                                        : isOutOfStock
                                                            ? "Out of Stock"
                                                            : "🛒 Add to Cart"}
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>

            <footer className="shop-footer">
                <span>🌱 Farm2Home</span>
                <p>
                    Connecting farmers and customers, one harvest at a time.
                </p>
            </footer>
        </div>
    );
}

export default Shop;
