import { useEffect, useState } from "react";

function Orders({ onBack, onViewOrder }) {

    const [orders, setOrders] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [updatingOrder, setUpdatingOrder] = useState(null);

    const [successMessage, setSuccessMessage] = useState("");


    const token = localStorage.getItem("token");


    // =====================================================
    // FETCH ORDERS
    // =====================================================

    useEffect(() => {
        fetchOrders();
    }, []);


    const fetchOrders = async () => {

        try {

            setLoading(true);

            setError("");

            const response = await fetch(
                "http://localhost:5000/api/orders",
                {
                    method: "GET",

                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );


            const text = await response.text();

            let data = {};

            try {

                data = text
                    ? JSON.parse(text)
                    : {};

            } catch {

                throw new Error(
                    "Invalid response from order server."
                );

            }


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to load orders."
                );

            }


            setOrders(data.orders || []);


        } catch (err) {

            console.error(
                "GET ORDERS ERROR:",
                err
            );

            setError(err.message);


        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // CONFIRM / UNCONFIRM ORDER
    // =====================================================

    const toggleConfirmation = async (order) => {

        // Only allow Pending <-> Confirmed
        if (
            order.status !== "Pending" &&
            order.status !== "Confirmed"
        ) {
            return;
        }


        const newStatus =
            order.status === "Pending"
                ? "Confirmed"
                : "Pending";


        try {

            setUpdatingOrder(order._id);

            setError("");

            setSuccessMessage("");


            const response = await fetch(
                `http://localhost:5000/api/orders/${order._id}/status`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        status: newStatus
                    })
                }
            );


            const text = await response.text();

            let data = {};

            try {

                data = text
                    ? JSON.parse(text)
                    : {};

            } catch {

                throw new Error(
                    "Invalid response from server."
                );

            }


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to update order status."
                );

            }


            // Update order immediately
            setOrders((previousOrders) =>
                previousOrders.map((item) =>
                    item._id === order._id
                        ? {
                            ...item,
                            status: newStatus
                        }
                        : item
                )
            );


            setSuccessMessage(
                newStatus === "Confirmed"
                    ? "✓ Order confirmed successfully"
                    : "✓ Order moved back to Pending"
            );


            // Remove message after 3 seconds
            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);


        } catch (err) {

            console.error(
                "UPDATE ORDER STATUS ERROR:",
                err
            );

            setError(err.message);

        } finally {

            setUpdatingOrder(null);

        }

    };


    // =====================================================
    // ITEM COUNT
    // =====================================================

    const getItemCount = (items) => {

        if (!items) return 0;


        return items.reduce(
            (total, item) =>
                total +
                Number(item.quantity || 0),
            0
        );

    };


    // =====================================================
    // ORDER ID
    // =====================================================

    const getOrderId = (id) => {

        if (!id) return "N/A";


        return id
            .slice(-8)
            .toUpperCase();

    };


    // =====================================================
    // STATUS CLASS
    // =====================================================

    const getStatusClass = (status) => {

        return String(status || "Pending")
            .toLowerCase()
            .replace(/\s+/g, "-");

    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="orders-page">

                <div className="orders-loading">

                    <div className="orders-spinner"></div>

                    <p>
                        Loading your orders...
                    </p>

                </div>

            </div>

        );

    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="orders-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="orders-header">

                <div>

                    <button
                        className="orders-back-button"
                        onClick={onBack}
                    >
                        ← Dashboard
                    </button>


                    <h1>
                        My Orders
                    </h1>


                    <p>
                        View and track all your
                        StudentMart purchases.
                    </p>

                </div>


                <div className="orders-count">

                    <strong>
                        {orders.length}
                    </strong>

                    <span>
                        Total Orders
                    </span>

                </div>

            </div>


            {/* =================================================
                SUCCESS MESSAGE
            ================================================= */}

            {successMessage && (

                <div className="orders-success-message">

                    {successMessage}

                </div>

            )}


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="orders-error">

                    <strong>
                        Unable to load orders
                    </strong>


                    <p>
                        {error}
                    </p>


                    <button
                        onClick={fetchOrders}
                    >
                        Try Again
                    </button>

                </div>

            )}


            {/* =================================================
                EMPTY
            ================================================= */}

            {!error && orders.length === 0 && (

                <div className="orders-empty">

                    <div className="orders-empty-icon">
                        📦
                    </div>


                    <h2>
                        No orders yet
                    </h2>


                    <p>
                        Your placed orders will
                        appear here.
                    </p>

                </div>

            )}


            {/* =================================================
                ORDERS
            ================================================= */}

            {!error && orders.length > 0 && (

                <div className="orders-list">

                    {orders.map((order) => (

                        <div
                            className="order-card"
                            key={order._id}
                        >


                            {/* =================================================
                                ORDER TOP
                            ================================================= */}

                            <div className="order-card-top">

                                <div>

                                    <span className="order-label">
                                        Order ID
                                    </span>


                                    <h3>
                                        #
                                        {getOrderId(
                                            order._id
                                        )}
                                    </h3>

                                </div>


                                <span
                                    className={
                                        `order-status ${getStatusClass(
                                            order.status
                                        )}`
                                    }
                                >
                                    {order.status ||
                                        "Pending"}
                                </span>

                            </div>


                            {/* =================================================
                                ITEMS
                            ================================================= */}

                            <div className="order-items-preview">

                                {order.items?.slice(
                                    0,
                                    3
                                ).map(
                                    (item, index) => (

                                        <div
                                            className="order-item-preview"
                                            key={
                                                `${order._id}-${index}`
                                            }
                                        >

                                            <div className="order-item-icon">
                                                📦
                                            </div>


                                            <div>

                                                <strong>
                                                    {item.title}
                                                </strong>


                                                <span>
                                                    Qty:{" "}
                                                    {item.quantity}
                                                </span>

                                            </div>

                                        </div>

                                    )
                                )}


                                {order.items?.length > 3 && (

                                    <span className="more-items">

                                        +
                                        {order.items.length - 3}
                                        {" "}more

                                    </span>

                                )}

                            </div>


                            {/* =================================================
                                ORDER INFO
                            ================================================= */}

                            <div className="order-card-info">

                                <div>

                                    <span>
                                        Order Date
                                    </span>


                                    <strong>

                                        {new Date(
                                            order.orderDate ||
                                            order.createdAt
                                        ).toLocaleDateString(
                                            "en-IN",
                                            {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric"
                                            }
                                        )}

                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Items
                                    </span>


                                    <strong>
                                        {getItemCount(
                                            order.items
                                        )}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Total
                                    </span>


                                    <strong>

                                        ₹
                                        {Number(
                                            order.totalAmount ||
                                            0
                                        ).toFixed(2)}

                                    </strong>

                                </div>

                            </div>


                            {/* =================================================
                                ORDER FOOTER
                            ================================================= */}

                            <div className="order-card-footer">


                                <div className="order-status-control">

                                    <span>
                                        Status:{" "}
                                        <strong>
                                            {order.status ||
                                                "Pending"}
                                        </strong>
                                    </span>


                                    {/* =================================================
                                        CONFIRMATION TOGGLE
                                    ================================================= */}

                                    <div className="confirmation-control">

                                        <span className="confirmation-label">
                                            Confirm Order
                                        </span>


                                        <button
                                            type="button"
                                            className={
                                                `confirmation-toggle ${
                                                    order.status ===
                                                    "Confirmed"
                                                        ? "active"
                                                        : ""
                                                }`
                                            }
                                            disabled={
                                                updatingOrder ===
                                                    order._id ||
                                                (
                                                    order.status !==
                                                        "Pending" &&
                                                    order.status !==
                                                        "Confirmed"
                                                )
                                            }
                                            onClick={() =>
                                                toggleConfirmation(
                                                    order
                                                )
                                            }
                                            aria-label={
                                                order.status ===
                                                "Confirmed"
                                                    ? "Unconfirm order"
                                                    : "Confirm order"
                                            }
                                        >

                                            <span className="toggle-knob">
                                                {updatingOrder ===
                                                order._id
                                                    ? "..."
                                                    : ""}
                                            </span>

                                        </button>


                                        <span
                                            className={
                                                `toggle-text ${
                                                    order.status ===
                                                    "Confirmed"
                                                        ? "on"
                                                        : "off"
                                                }`
                                            }
                                        >
                                            {order.status ===
                                            "Confirmed"
                                                ? "ON"
                                                : "OFF"}
                                        </span>

                                    </div>

                                </div>


                                {/* =================================================
                                    VIEW ORDER
                                ================================================= */}

                                <button
                                    className="view-order-button"
                                    onClick={() => {

                                        if (onViewOrder) {

                                            onViewOrder(
                                                order
                                            );

                                        }

                                    }}
                                >
                                    View Order →
                                </button>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>

    );

}


export default Orders;