
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "./Checkout.css";

const initialAddress = {
    name: "",
    phone: "",
    village: "",
    district: "",
    state: "",
    pincode: "",
};

function Checkout() {
    const navigate = useNavigate();

    const [cart, setCart] = useState({
        items: [],
        totalItems: 0,
        totalAmount: 0,
    });

    const [address, setAddress] = useState(initialAddress);
    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [error, setError] = useState("");
    const [successOrder, setSuccessOrder] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("farm2home_token");

        if (!token) {
            navigate("/login/customer", { replace: true });
            return;
        }

        loadCart();
    }, [navigate]);

    async function loadCart() {
        try {
            setError("");

            const response = await api.get("/cart");

            const cartData = response.data.cart || {
                items: [],
                totalItems: 0,
                totalAmount: 0,
            };

            setCart(cartData);

            if (!cartData.items || cartData.items.length === 0) {
                setError("Your cart is empty. Please add products before checkout.");
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load your cart. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    function handleChange(event) {
        const { name, value } = event.target;

        setAddress((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    const subtotal = useMemo(() => {
        return (cart.items || []).reduce((total, item) => {
            const price = Number(item.product?.price ?? item.price ?? 0);
            const quantity = Number(item.quantity || 0);

            return total + price * quantity;
        }, 0);
    }, [cart.items]);

    function formatPrice(amount) {
        return Number(amount || 0).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
        });
    }

    function validateAddress() {
        const requiredFields = [
            ["name", "Please enter the receiver's name."],
            ["phone", "Please enter a mobile number."],
            ["village", "Please enter your village or town."],
            ["district", "Please enter your district."],
            ["state", "Please enter your state."],
            ["pincode", "Please enter your PIN code."],
        ];

        for (const [field, message] of requiredFields) {
            if (!address[field].trim()) {
                return message;
            }
        }

        const phoneDigits = address.phone.replace(/\D/g, "");

        if (phoneDigits.length < 10 || phoneDigits.length > 15) {
            return "Please enter a valid mobile number.";
        }

        if (!/^[0-9]{4,10}$/.test(address.pincode.trim())) {
            return "Please enter a valid PIN code.";
        }

        return "";
    }

    async function handlePlaceOrder(event) {
        event.preventDefault();

        if (placingOrder) return;

        setError("");

        if (!cart.items || cart.items.length === 0) {
            setError("Your cart is empty. Please add products first.");
            return;
        }

        const validationError = validateAddress();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setPlacingOrder(true);

            const response = await api.post("/orders", {
                shippingAddress: {
                    name: address.name.trim(),
                    phone: address.phone.trim(),
                    village: address.village.trim(),
                    district: address.district.trim(),
                    state: address.state.trim(),
                    pincode: address.pincode.trim(),
                },
            });

            if (!response.data?.success || !response.data?.order) {
                throw new Error(
                    response.data?.message || "Order could not be placed."
                );
            }

            setSuccessOrder(response.data.order);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to place your order. Please try again."
            );
        } finally {
            setPlacingOrder(false);
        }
    }

    if (loading) {
        return (
            <div className="checkout-message">
                Loading checkout...
            </div>
        );
    }

    // Order confirmation screen
    if (successOrder) {
        return (
            <div className="checkout-page">
                <header className="checkout-header">
                    <Link to="/shop" className="checkout-brand">
                        🌱 Farm2Home
                    </Link>
                </header>

                <main className="checkout-success">
                    <div className="success-icon">✓</div>

                    <h1>Order placed successfully!</h1>

                    <p>
                        Thank you for shopping with Farm2Home.
                        Your order has been received.
                    </p>

                    <div className="success-order-details">
                        <span>Order number</span>
                        <strong>{successOrder.orderNumber}</strong>

                        <span>Order amount</span>
                        <strong>
                            {formatPrice(successOrder.totalAmount)}
                        </strong>

                        <span>Payment method</span>
                        <strong>Cash on Delivery</strong>

                        <span>Payment status</span>
                        <strong>{successOrder.paymentStatus}</strong>
                    </div>

                    <div className="success-actions">
                        <button
                            onClick={() => navigate("/customer/orders")}
                        >
                            View My Orders
                        </button>

                        <Link to="/shop">
                            Continue Shopping
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <header className="checkout-header">
                <Link to="/shop" className="checkout-brand">
                    🌱 Farm2Home
                </Link>

                <Link to="/customer/cart" className="checkout-back">
                    ← Back to Cart
                </Link>
            </header>

            <main className="checkout-container">
                <div className="checkout-heading">
                    <p className="checkout-eyebrow">FARM2HOME CHECKOUT</p>
                    <h1>Complete Your Order</h1>
                    <p>
                        Enter your delivery details and place your order.
                    </p>
                </div>

                {error && (
                    <div className="checkout-error" role="alert">
                        {error}
                    </div>
                )}

                {!cart.items || cart.items.length === 0 ? (
                    <div className="checkout-empty">
                        <h2>Your cart is empty</h2>
                        <p>Add products before proceeding to checkout.</p>

                        <Link to="/shop">
                            Explore Products
                        </Link>
                    </div>
                ) : (
                    <form
                        className="checkout-layout"
                        onSubmit={handlePlaceOrder}
                    >
                        <section className="checkout-form-section">
                            <div className="checkout-card">
                                <div className="checkout-section-heading">
                                    <span>1</span>
                                    <div>
                                        <h2>Delivery Address</h2>
                                        <p>
                                            Where should we deliver your order?
                                        </p>
                                    </div>
                                </div>

                                <div className="checkout-fields">
                                    <label>
                                        Receiver Name *
                                        <input
                                            type="text"
                                            name="name"
                                            value={address.name}
                                            onChange={handleChange}
                                            placeholder="Enter full name"
                                            maxLength={100}
                                            autoComplete="name"
                                            required
                                        />
                                    </label>

                                    <label>
                                        Mobile Number *
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={address.phone}
                                            onChange={handleChange}
                                            placeholder="Enter mobile number"
                                            maxLength={15}
                                            autoComplete="tel"
                                            required
                                        />
                                    </label>

                                    <label>
                                        Village / Town *
                                        <input
                                            type="text"
                                            name="village"
                                            value={address.village}
                                            onChange={handleChange}
                                            placeholder="Enter village or town"
                                            maxLength={100}
                                            autoComplete="address-level3"
                                            required
                                        />
                                    </label>

                                    <label>
                                        District *
                                        <input
                                            type="text"
                                            name="district"
                                            value={address.district}
                                            onChange={handleChange}
                                            placeholder="Enter district"
                                            maxLength={100}
                                            required
                                        />
                                    </label>

                                    <label>
                                        State *
                                        <input
                                            type="text"
                                            name="state"
                                            value={address.state}
                                            onChange={handleChange}
                                            placeholder="Enter state"
                                            maxLength={100}
                                            autoComplete="address-level1"
                                            required
                                        />
                                    </label>

                                    <label>
                                        PIN Code *
                                        <input
                                            type="text"
                                            name="pincode"
                                            value={address.pincode}
                                            onChange={handleChange}
                                            placeholder="Enter PIN code"
                                            maxLength={10}
                                            inputMode="numeric"
                                            autoComplete="postal-code"
                                            required
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="checkout-card payment-card">
                                <div className="checkout-section-heading">
                                    <span>2</span>
                                    <div>
                                        <h2>Payment Method</h2>
                                        <p>Choose how you want to pay.</p>
                                    </div>
                                </div>

                                <div className="payment-option">
                                    <span className="payment-icon">💵</span>
                                    <div>
                                        <strong>Cash on Delivery (COD)</strong>
                                        <p>
                                            Pay when your products are delivered.
                                        </p>
                                    </div>
                                    <span className="payment-selected">✓</span>
                                </div>

                                <p className="payment-note">
                                    Online payment will be added in a future
                                    Farm2Home update.
                                </p>
                            </div>
                        </section>

                        <aside className="checkout-summary">
                            <h2>Order Summary</h2>

                            <div className="checkout-items">
                                {cart.items.map((item) => {
                                    const product = item.product;

                                    if (!product) return null;

                                    const price = Number(
                                        product.price ?? item.price ?? 0
                                    );

                                    return (
                                        <div
                                            className="checkout-item"
                                            key={product._id}
                                        >
                                            <div className="checkout-item-image">
                                                {product.imageUrl ? (
                                                    <img
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                    />
                                                ) : (
                                                    <span>🌱</span>
                                                )}
                                            </div>

                                            <div className="checkout-item-info">
                                                <strong>{product.name}</strong>
                                                <span>
                                                    Qty: {item.quantity} {product.unit}
                                                </span>
                                                <span>
                                                    Farmer: {product.farmer?.name || "Farm2Home Farmer"}
                                                </span>
                                            </div>

                                            <strong className="checkout-item-price">
                                                {formatPrice(price * item.quantity)}
                                            </strong>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="checkout-summary-row">
                                <span>Total items</span>
                                <strong>{cart.totalItems}</strong>
                            </div>

                            <div className="checkout-summary-row">
                                <span>Subtotal</span>
                                <strong>{formatPrice(subtotal)}</strong>
                            </div>

                            <div className="checkout-summary-row">
                                <span>Delivery</span>
                                <strong className="free-delivery">To be confirmed</strong>
                            </div>

                            <div className="checkout-total">
                                <span>Order Total</span>
                                <strong>{formatPrice(subtotal)}</strong>
                            </div>

                            <button
                                className="place-order-button"
                                type="submit"
                                disabled={placingOrder}
                            >
                                {placingOrder
                                    ? "Placing Your Order..."
                                    : `Place Order · ${formatPrice(subtotal)}`}
                            </button>

                            <p className="checkout-secure-note">
                                Your order will be securely saved in Farm2Home.
                            </p>
                        </aside>
                    </form>
                )}
            </main>
        </div>
    );
}

export default Checkout;
