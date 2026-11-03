
import { useEffect, useState } from "react";
import { handleProductImageError, resolveProductImage } from "../utils/productImage.js";
import { apiUrl } from "../utils/api.js";
import WelcomeAvatar from "../components/WelcomeAvatar.jsx";

function Dashboard({
    onSellClick,
    onBrowseClick,
    onCartClick,
    onOrdersClick,
    onProfileClick,
    onRequestsClick,
    onOffersClick,
    onProductClick
}) {
    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem("user") || "null")
    );
    const [error, setError] = useState("");
    const [active, setActive] = useState("dashboard");
    const [mobileMenu, setMobileMenu] = useState(false);
    const [activity, setActivity] = useState({ cartItems: 0, incomingOrders: [], recentProducts: [] });
    const [confirmingOrderId, setConfirmingOrderId] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");

        fetch(
            apiUrl("auth/profile"),
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
            .then(async (response) => {
                if (
                    !(response.headers.get("content-type") || "")
                        .includes("application/json")
                ) {
                    throw new Error("Unable to connect to StudentMart API.");
                }

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Unable to load profile.");
                }

                const cachedUser = JSON.parse(localStorage.getItem("user") || "null");
                const currentUser = { ...data.user, gender: data.user.gender || cachedUser?.gender || "" };
                setUser(currentUser);
                localStorage.setItem("user", JSON.stringify(currentUser));
            })
            .catch((err) => setError(err.message));
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        Promise.all([
            fetch(apiUrl("products"), { headers }).then((r) => r.json()),
            fetch(apiUrl("cart"), { headers }).then((r) => r.json()),
            fetch(apiUrl("orders/incoming"), { headers }).then(async (response) => {
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || "Unable to load incoming orders");
                return data;
            })
        ]).then(([productData, cartData, incomingOrderData]) => {
            const allProducts = Array.isArray(productData) ? productData : productData.products || [];
            const cart = cartData.cart || { items: [] };
            const cartItems = cart.items || [];
            setActivity({
                cartItems: cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
                incomingOrders: (incomingOrderData.orders || []).filter((order) => String(order.status).toLowerCase() === "pending"),
                recentProducts: (() => {
                    const popular = [...allProducts].sort((a, b) => Number(b.views || 0) - Number(a.views || 0));
                    const books = popular.filter((product) => product.author || /book|novel|story|text/i.test(`${product.category || ""} ${product.title || ""}`));
                    return (books.length ? books : popular).slice(0, 5);
                })()
            });
        }).catch((err) => {
            console.error("Dashboard activity load error:", err);
            setError(err.message || "Unable to load dashboard activity.");
        });
    }, [user]);

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.reload();
    };

    const navigate = (name, callback) => {
        setActive(name);
        setMobileMenu(false);
        if (callback) callback();
    };

    const confirmIncomingOrder = async (orderId) => {
        if (!/^[a-f\d]{24}$/i.test(String(orderId || ""))) {
            setError("This order has an invalid ID. Refresh the dashboard and try again.");
            return;
        }
        setConfirmingOrderId(orderId);
        setError("");
        try {
            const response = await fetch(apiUrl(`orders/incoming/${orderId}/confirm`), {
                method: "PUT",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Unable to confirm order");
            setActivity((current) => ({
                ...current,
                incomingOrders: current.incomingOrders.filter((order) => String(order.id || order._id) !== orderId)
            }));
        } catch (err) { setError(err.message); }
        finally { setConfirmingOrderId(""); }
    };

    const menuItems = [
        {
            id: "dashboard",
            icon: "▦",
            label: "Dashboard",
            action: null
        },
        {
            id: "products",
            icon: "⌕",
            label: "Browse Products",
            action: onBrowseClick
        },
        {
            id: "sell",
            icon: "+",
            label: "Sell Product",
            action: onSellClick
        },
        {
            id: "cart",
            icon: "🛒",
            label: "My Cart",
            action: onCartClick
        },
        {
            id: "orders",
            icon: "▤",
            label: "My Orders",
            action: onOrdersClick
        },
        {
            id: "requests",
            icon: "♡",
            label: "Book Wish Board",
            action: () => onRequestsClick?.()
        },
        {
            id: "offers",
            icon: "◇",
            label: "Buyer Offers",
            action: () => onOffersClick?.()
        },
        {
            id: "profile",
            icon: "◉",
            label: "My Profile",
            action: () => onProfileClick?.()
        }
    ];

    const firstName = user?.name?.split(" ")[0] || "Student";
    const welcomeDate = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date());
    const initials = user?.name
        ? user.name.split(" ").map(part => part[0]).join("").slice(0, 2).toUpperCase()
        : "S";

    const sidebar = (
        <>
            <div className="sidebar-brand">
                <div className="sidebar-logo">S</div>
                <div>
                    <h2>Student<span>Mart</span></h2>
                    <p>Your campus marketplace</p>
                </div>
            </div>

            <p className="sidebar-section-label">MAIN MENU</p>

            <nav className="sidebar-nav">
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        type="button"
                        className={`nav-item ${active === item.id ? "active" : ""}`}
                        onClick={() => navigate(item.id, item.action)}
                    >
                        <span>{item.icon}</span>
                        {item.label}
                    </button>
                ))}
            </nav>

        </>
    );

    return (
        <div className="dashboard">

            <aside className="dashboard-sidebar">
                {sidebar}
            </aside>

            {mobileMenu && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setMobileMenu(false)}
                >
                    <aside
                        className="dashboard-sidebar mobile-sidebar"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="mobile-close"
                            onClick={() => setMobileMenu(false)}
                        >
                            ×
                        </button>
                        {sidebar}
                    </aside>
                </div>
            )}

            <main className="dashboard-main">

                <header className="dashboard-header">

                    <button
                        className="mobile-menu-button"
                        onClick={() => setMobileMenu(true)}
                        aria-label="Open navigation menu"
                    >
                        ☰
                    </button>

                    <div className="mobile-brand">
                        <div className="sidebar-logo">S</div>
                        <strong>Student<span>Mart</span></strong>
                    </div>

                    <div className="header-search">
                        <span>⌕</span>
                        <input
                            type="text"
                            placeholder="Search StudentMart..."
                            onKeyDown={(e) => {
                                if (e.key === "Enter") onBrowseClick();
                            }}
                        />
                    </div>

                    <div className="header-right">
                        <button className="dashboard-header-cart" type="button" onClick={() => navigate("cart", onCartClick)}>🛒 View Cart{activity.cartItems > 0 ? ` (${activity.cartItems})` : ""}</button>
                        <button className="dashboard-header-sell" type="button" onClick={() => navigate("sell", onSellClick)}>+ Sell an Item</button>
                        <button className="dashboard-profile-action" type="button" onClick={() => onProfileClick?.()}>My Profile</button>
                        <button className="dashboard-signout-action" type="button" onClick={logout}>Sign out</button>
                    </div>

                </header>

                <section className="dashboard-content">

                    <div className="welcome-section">
                        <div className="dashboard-welcome-banner">
                            <div className="dashboard-welcome-copy">
                                <span className="dashboard-welcome-date">{welcomeDate}</span>
                                <h1>Welcome back, {firstName}!</h1>
                                <p>Always stay updated on your student portal.</p>
                            </div>
                            <WelcomeAvatar gender={user?.gender} />
                        </div>
                    </div>

                    {error && (
                        <div className="simple-error" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="reference-dashboard-grid">
                        <div className="reference-dashboard-main">
                            <div className="actionable-panels">
                                <section className="action-panel meetup-panel">
                                    <div className="action-panel-heading"><div><h3>Incoming Orders</h3><p>Orders placed on your listings.</p></div><span>📦</span></div>
                                    {activity.incomingOrders.length ? <div className="confirmed-order-list">{activity.incomingOrders.map((order) => { const orderId = String(order.id || order._id || ""); const validOrderId = /^[a-f\d]{24}$/i.test(orderId); const item = order.sellerItems?.[0] || order.items?.[0]; const product = item?.product; return <article className="confirmed-order-item" key={orderId || `${item?.title || "order"}-${order.status}`}><div className="meetup-order-product"><img src={resolveProductImage(product?.image, product)} alt="" loading="lazy" decoding="async" onError={(event) => handleProductImageError(event, product)} /><b>{product?.title || item?.title || "Your listing"}</b></div><div className="confirmed-order-meta"><span className="confirmed-order-badge pending">Pending</span><small>Buyer: {order.user?.name || "Student"}</small></div><small>Pickup: {product?.pickup || "Coordinate with buyer"}</small>{validOrderId && <button className="confirm-order-button" type="button" disabled={confirmingOrderId === orderId} onClick={() => confirmIncomingOrder(orderId)}>{confirmingOrderId === orderId ? "Confirming…" : "Confirm order"}</button>}</article>; })}</div> : <div className="meetup-empty"><b>No orders are pending</b><span>Any new orders placed on your listings will appear here for confirmation.</span></div>}
                                </section>
                            </div>

                        </div>

                        <aside className="reference-dashboard-side">
                            <section className="account-card reference-account-card"><div className="account-header"><div className="large-avatar">{initials}</div><div><h3>{user?.name || "Student"}</h3><p>Student Account</p></div></div><div className="account-info"><div><span>Full Name</span><strong>{user?.name || "Not available"}</strong></div><div><span>Email Address</span><strong>{user?.email || "Not available"}</strong></div></div><button className="panel-link" onClick={() => onProfileClick?.()}>Manage my profile →</button></section>

                        </aside>
                    </div>

                    <section className="trending-panel">
                        <div className="trending-heading"><div><h2>Trending Books, Novels & Stories on Campus</h2><p>Popular student listings, sorted by views.</p></div><button onClick={() => navigate("products", onBrowseClick)}>Browse all →</button></div>
                        {activity.recentProducts.length ? <div className="trending-books-grid">{activity.recentProducts.map((product, index) => <button className="trending-book-card" key={product._id} onClick={() => onProductClick ? onProductClick(product) : navigate("products", onBrowseClick)}>
                            <div className="trending-book-image"><img src={resolveProductImage(product.image, product)} alt={product.title} loading="lazy" decoding="async" fetchPriority={index === 0 ? "high" : "auto"} onError={(event) => handleProductImageError(event, product)} /></div>
                            <strong title={product.title}>{product.title}</strong>{product.author && <small>{product.author}</small>}
                            <div className="trending-book-meta"><b>₹{Number(product.price || 0).toLocaleString("en-IN")}</b><span>{product.condition || "Available"}</span></div>
                            <div className="trending-book-tags"><span>{product.category || "Other"}</span>{product.rentPrice > 0 && <span>₹{product.rentPrice}/wk rent</span>}</div>
                        </button>)}</div> : <div className="meetup-empty"><b>No products listed yet</b><button onClick={() => navigate("sell", onSellClick)}>List the first item</button></div>}
                    </section>
                    <footer className="simple-footer">
                        StudentMart · Made for campus life
                    </footer>

                </section>
            </main>
        </div>
    );
}

export default Dashboard;
