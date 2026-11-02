
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "./Cart.css";

function Cart() {
    const navigate = useNavigate();

    const [cart, setCart] = useState({
        items: [],
        totalItems: 0,
        totalAmount: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState("");

    // Load the customer's cart from the backend
    async function fetchCart() {
        try {
            setError("");

            const response = await api.get("/cart");

            setCart(
                response.data.cart || {
                    items: [],
                    totalItems: 0,
                    totalAmount: 0,
                }
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load your cart."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const token = localStorage.getItem("farm2home_token");

        if (!token) {
            navigate("/login/customer", { replace: true });
            return;
        }

        fetchCart();
    }, []);

    // Update product quantity
    async function updateQuantity(productId, quantity) {
        if (quantity < 1) return;

        try {
            setBusy(productId);
            setError("");

            await api.patch(`/cart/items/${productId}`, {
                quantity,
            });

            await fetchCart();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update product quantity."
            );
        } finally {
            setBusy("");
        }
    }

    // Remove an individual product
    async function removeProduct(productId) {
        try {
            setBusy(productId);
            setError("");

            await api.delete(`/cart/items/${productId}`);

            await fetchCart();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to remove this product."
            );
        } finally {
            setBusy("");
        }
    }

    // Clear all products from the cart
    async function clearCart() {
        const confirmed = window.confirm(
            "Are you sure you want to clear your cart?"
        );

        if (!confirmed) return;

        try {
            setBusy("clear");
            setError("");

            await api.delete("/cart");

            await fetchCart();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to clear your cart."
            );
        } finally {
            setBusy("");
        }
    }

    function formatPrice(amount) {
        return Number(amount || 0).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
        });
    }

    if (loading) {
        return (
            <div className="cart-message">
                Loading your cart...
            </div>
        );
    }

    return (
        <div className="cart-page">

            {/* Header */}
            <header className="cart-header">
                <Link to="/shop" className="cart-brand">
                    🌱 Farm2Home
                </Link>

                <Link to="/shop" className="continue-shopping">
                    Continue Shopping
                </Link>
            </header>

            <main className="cart-container">

                <div className="cart-title-row">
                    <div>
                        <h1>My Shopping Cart</h1>
                        <p>
                            {cart.totalItems || 0} items in your cart
                        </p>
                    </div>

                    {cart.items?.length > 0 && (
                        <button
                            className="clear-cart-button"
                            onClick={clearCart}
                            disabled={busy !== ""}
                        >
                            Clear Cart
                        </button>
                    )}
                </div>

                {error && (
                    <div className="cart-error">
                        {error}
                    </div>
                )}

                {/* Empty Cart */}
                {!cart.items || cart.items.length === 0 ? (
                    <div className="empty-cart">
                        <div className="empty-cart-icon">🛒</div>

                        <h2>Your cart is empty</h2>

                        <p>
                            Discover fresh products directly from farmers.
                        </p>

                        <Link to="/shop" className="shop-now-button">
                            Explore Products
                        </Link>
                    </div>
                ) : (

                    <div className="cart-layout">

                        {/* Cart Products */}
                        <section className="cart-products">

                            {cart.items.map((item) => {
                                const product = item.product;

                                if (!product) return null;

                                const productId = product._id;
                                const isBusy = busy === productId;

                                return (
                                    <article
                                        className="cart-product"
                                        key={productId}
                                    >

                                        <div className="cart-product-image">
                                            {product.imageUrl ? (
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                />
                                            ) : (
                                                <span>🌱</span>
                                            )}
                                        </div>

                                        <div className="cart-product-info">
                                            <h3>{product.name}</h3>

                                            <p>
                                                Farmer:{" "}
                                                {product.farmer?.name ||
                                                    "Farm2Home Farmer"}
                                            </p>

                                            <p className="cart-product-price">
                                                {formatPrice(product.price)}
                                                {" / "}
                                                {product.unit}
                                            </p>

                                            <div className="quantity-controls">
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            productId,
                                                            item.quantity - 1
                                                        )
                                                    }
                                                    disabled={
                                                        isBusy ||
                                                        item.quantity <= 1
                                                    }
                                                >
                                                    −
                                                </button>

                                                <span>{item.quantity}</span>

                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            productId,
                                                            item.quantity + 1
                                                        )
                                                    }
                                                    disabled={
                                                        isBusy ||
                                                        item.quantity >=
                                                        Number(
                                                            product.quantity
                                                        )
                                                    }
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        <div className="cart-product-actions">
                                            <strong>
                                                {formatPrice(
                                                    item.lineTotal ??
                                                    item.price * item.quantity
                                                )}
                                            </strong>

                                            <button
                                                className="remove-product-button"
                                                onClick={() =>
                                                    removeProduct(productId)
                                                }
                                                disabled={isBusy}
                                            >
                                                Remove
                                            </button>
                                        </div>

                                    </article>
                                );
                            })}

                        </section>

                        {/* Cart Summary */}
                        <aside className="cart-summary">

                            <h2>Order Summary</h2>

                            <div className="summary-row">
                                <span>Total Items</span>
                                <strong>{cart.totalItems}</strong>
                            </div>

                            <div className="summary-row">
                                <span>Subtotal</span>
                                <strong>
                                    {formatPrice(cart.totalAmount)}
                                </strong>
                            </div>

                            <div className="summary-divider" />

                            <div className="summary-total">
                                <span>Total Amount</span>
                                <strong>
                                    {formatPrice(cart.totalAmount)}
                                </strong>
                            </div>

                            <button
                                className="checkout-button"
                                onClick={() =>
                                    navigate("/customer/checkout")
                                }
                            >
                                Proceed to Checkout
                            </button>

                            <p className="cart-note">
                                Fresh products directly from farmers.
                            </p>

                        </aside>

                    </div>
                )}

            </main>
        </div>
    );
}

export default Cart;
