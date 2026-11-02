
import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./FarmerOrders.css";

const STATUSES = [
    "Pending",
    "Confirmed",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
];

const NEXT_STATUS = {
    Pending: "Confirmed",
    Confirmed: "Processing",
    Processing: "Shipped",
    Shipped: "Delivered",
};

function formatDate(date) {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

export default function FarmerOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingItem, setUpdatingItem] = useState("");
    const [filter, setFilter] = useState("All");

    async function loadOrders() {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/orders/farmer");
            setOrders(response.data?.orders || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load orders. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadOrders();
    }, []);

    async function updateStatus(orderId, itemId, status) {
        const key = `${orderId}-${itemId}`;

        try {
            setUpdatingItem(key);
            setError("");

            await api.patch(
                `/orders/${orderId}/items/${itemId}/status`,
                { status }
            );

            await loadOrders();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update order status."
            );
        } finally {
            setUpdatingItem("");
        }
    }

    const allItems = orders.flatMap((order) =>
        (order.items || []).map((item) => ({
            ...item,
            orderId: order._id,
            orderNumber: order.orderNumber,
            orderDate: order.createdAt,
            customer: order.customer,
            shippingAddress: order.shippingAddress,
        }))
    );

    const filteredItems =
        filter === "All"
            ? allItems
            : allItems.filter((item) => item.status === filter);

    if (loading) {
        return (
            <main className="farmer-orders-page">
                <p className="orders-message">Loading your orders...</p>
            </main>
        );
    }

    return (
        <main className="farmer-orders-page">
            <header className="orders-header">
                <div>
                    <p className="orders-eyebrow">FARMER DASHBOARD</p>
                    <h1>My Orders</h1>
                    <p className="orders-subtitle">
                        Manage orders for products sold through Farm2Home.
                    </p>
                </div>

                <button
                    type="button"
                    className="orders-refresh"
                    onClick={loadOrders}
                    disabled={loading}
                >
                    Refresh orders
                </button>
            </header>

            {error && (
                <div className="orders-error" role="alert">
                    {error}
                </div>
            )}

            <section className="orders-summary">
                <div className="orders-stat">
                    <span>Total items</span>
                    <strong>{allItems.length}</strong>
                </div>

                <div className="orders-stat">
                    <span>Pending</span>
                    <strong>
                        {allItems.filter((item) => item.status === "Pending").length}
                    </strong>
                </div>

                <div className="orders-stat">
                    <span>In progress</span>
                    <strong>
                        {
                            allItems.filter((item) =>
                                ["Confirmed", "Processing", "Shipped"].includes(
                                    item.status
                                )
                            ).length
                        }
                    </strong>
                </div>

                <div className="orders-stat">
                    <span>Delivered</span>
                    <strong>
                        {allItems.filter((item) => item.status === "Delivered").length}
                    </strong>
                </div>
            </section>

            <section className="orders-list-section">
                <div className="orders-list-heading">
                    <h2>Order details</h2>

                    <label className="orders-filter">
                        Filter:
                        <select
                            value={filter}
                            onChange={(event) => setFilter(event.target.value)}
                        >
                            <option value="All">All statuses</option>
                            {STATUSES.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                {filteredItems.length === 0 ? (
                    <div className="orders-empty">
                        <h3>No orders found</h3>
                        <p>
                            {allItems.length === 0
                                ? "Orders containing your products will appear here after a customer places an order."
                                : "There are no items matching this status filter."}
                        </p>
                    </div>
                ) : (
                    <div className="orders-cards">
                        {filteredItems.map((item) => {
                            const nextStatus = NEXT_STATUS[item.status];
                            const key = `${item.orderId}-${item._id}`;

                            return (
                                <article className="farmer-order-card" key={key}>
                                    <div className="order-card-top">
                                        <div>
                                            <p className="order-number">
                                                Order #{item.orderNumber || item.orderId}
                                            </p>
                                            <p className="order-date">
                                                {formatDate(item.orderDate)}
                                            </p>
                                        </div>

                                        <span
                                            className={`order-status status-${(
                                                item.status || "Pending"
                                            )
                                                .toLowerCase()
                                                .replace(/\s+/g, "-")}`}
                                        >
                                            {item.status || "Pending"}
                                        </span>
                                    </div>

                                    <div className="order-product-details">
                                        {item.product?.imageUrl && (
                                            <img
                                                className="order-product-image"
                                                src={item.product.imageUrl}
                                                alt={item.productName}
                                            />
                                        )}

                                        <div className="order-product-info">
                                            <h3>{item.productName}</h3>
                                            <p>
                                                Quantity: {item.quantity} {item.unit}
                                            </p>
                                            <p>
                                                Price per unit: ₹
                                                {Number(item.price).toLocaleString("en-IN")}
                                            </p>
                                            <strong>
                                                Item total: ₹
                                                {(
                                                    Number(item.price) * Number(item.quantity)
                                                ).toLocaleString("en-IN")}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="order-customer-details">
                                        <h4>Customer details</h4>
                                        <p>
                                            <strong>Name:</strong>{" "}
                                            {item.shippingAddress?.name ||
                                                item.customer?.name ||
                                                "Not available"}
                                        </p>
                                        <p>
                                            <strong>Phone:</strong>{" "}
                                            {item.shippingAddress?.phone ||
                                                item.customer?.phone ||
                                                "Not available"}
                                        </p>
                                        <p>
                                            <strong>Delivery address:</strong>{" "}
                                            {[
                                                item.shippingAddress?.village,
                                                item.shippingAddress?.district,
                                                item.shippingAddress?.state,
                                                item.shippingAddress?.pincode,
                                            ]
                                                .filter(Boolean)
                                                .join(", ") || "Not available"}
                                        </p>
                                    </div>

                                    {nextStatus && (
                                        <button
                                            type="button"
                                            className="order-status-button"
                                            disabled={updatingItem === key}
                                            onClick={() =>
                                                updateStatus(
                                                    item.orderId,
                                                    item._id,
                                                    nextStatus
                                                )
                                            }
                                        >
                                            {updatingItem === key
                                                ? "Updating..."
                                                : `Mark as ${nextStatus}`}
                                        </button>
                                    )}

                                    {item.status === "Delivered" && (
                                        <p className="order-completed">
                                            This item has been delivered.
                                        </p>
                                    )}

                                    {item.status === "Cancelled" && (
                                        <p className="order-cancelled">
                                            This item was cancelled.
                                        </p>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
}
