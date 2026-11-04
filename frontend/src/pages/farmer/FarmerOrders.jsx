
import { useCallback, useEffect, useMemo, useState } from "react";
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

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "—";
    }

    return parsedDate.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function formatCurrency(value) {
    return Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export default function FarmerOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [updatingItem, setUpdatingItem] = useState("");
    const [filter, setFilter] = useState("All");
    const [lastUpdated, setLastUpdated] = useState(null);

    const loadOrders = useCallback(async ({ showLoader = false } = {}) => {
        try {
            if (showLoader) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            setError("");

            const response = await api.get("/orders/farmer");

            setOrders(response.data?.orders || []);
            setLastUpdated(new Date());
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load orders. Please try again."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadOrders({ showLoader: true });

        // Check for newly placed orders every 15 seconds.
        const intervalId = window.setInterval(() => {
            loadOrders();
        }, 15000);

        return () => window.clearInterval(intervalId);
    }, [loadOrders]);

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

    const allItems = useMemo(
        () =>
            orders.flatMap((order) =>
                (order.items || []).map((item) => ({
                    ...item,
                    orderId: order._id,
                    orderNumber: order.orderNumber,
                    orderDate: order.createdAt,
                    customer: order.customer,
                    shippingAddress: order.shippingAddress,
                }))
            ),
        [orders]
    );

    const filteredItems =
        filter === "All"
            ? allItems
            : allItems.filter((item) => item.status === filter);

    const pendingCount = allItems.filter(
        (item) => item.status === "Pending"
    ).length;

    const inProgressCount = allItems.filter((item) =>
        ["Confirmed", "Processing", "Shipped"].includes(item.status)
    ).length;

    const deliveredCount = allItems.filter(
        (item) => item.status === "Delivered"
    ).length;

    if (loading) {
        return (
            <main className="farmer-orders-page">
                <p className="orders-message">
                    Loading your orders...
                </p>
            </main>
        );
    }

    return (
        <main className="farmer-orders-page">

            <header className="orders-header">
                <div>
                    <p className="orders-eyebrow">
                        FARMER DASHBOARD
                    </p>

                    <h1>My Orders</h1>

                    <p className="orders-subtitle">
                        Manage orders for products sold through Farm2Home.
                    </p>

                    {lastUpdated && (
                        <p className="orders-last-updated">
                            Last checked: {formatDate(lastUpdated)}
                            {refreshing
                                ? " · Checking for new orders..."
                                : ""}
                        </p>
                    )}
                </div>

                <button
                    type="button"
                    className="orders-refresh"
                    onClick={() => loadOrders()}
                    disabled={refreshing}
                >
                    {refreshing ? "Refreshing..." : "Refresh orders"}
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
                    <strong>{pendingCount}</strong>
                </div>

                <div className="orders-stat">
                    <span>In progress</span>
                    <strong>{inProgressCount}</strong>
                </div>

                <div className="orders-stat">
                    <span>Delivered</span>
                    <strong>{deliveredCount}</strong>
                </div>

            </section>

            <section className="orders-list-section">

                <div className="orders-list-heading">
                    <h2>Order details</h2>

                    <label className="orders-filter">
                        Filter:

                        <select
                            value={filter}
                            onChange={(event) =>
                                setFilter(event.target.value)
                            }
                        >
                            <option value="All">
                                All statuses
                            </option>

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

                            const productImage = item.product?.imageUrl;

                            return (

                                <article
                                    className="farmer-order-card"
                                    key={key}
                                >

                                    <div className="order-card-top">

                                        <div>
                                            <p className="order-number">
                                                Order #
                                                {item.orderNumber || item.orderId}
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

                                        {productImage && (
                                            <img
                                                className="order-product-image"
                                                src={productImage}
                                                alt={
                                                    item.productName ||
                                                    "Ordered product"
                                                }
                                                loading="lazy"
                                            />
                                        )}

                                        <div className="order-product-info">

                                            <h3>
                                                {item.productName || "Product"}
                                            </h3>

                                            <p>
                                                Quantity: {item.quantity} {item.unit}
                                            </p>

                                            <p>
                                                Price per unit: ₹
                                                {formatCurrency(item.price)}
                                            </p>

                                            <strong>
                                                Item total: ₹
                                                {formatCurrency(
                                                    Number(item.price) *
                                                    Number(item.quantity)
                                                )}
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
                                                .join(", ") ||
                                                "Not available"}
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
                                                : item.status === "Pending"
                                                    ? "Accept order"
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
