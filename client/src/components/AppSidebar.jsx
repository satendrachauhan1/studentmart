const items = [
    { id: "dashboard", icon: "▦", label: "Dashboard" },
    { id: "products", icon: "⌕", label: "Browse Products" },
    { id: "sell", icon: "+", label: "Sell Product" },
    { id: "cart", icon: "🛒", label: "My Cart" },
    { id: "orders", icon: "▤", label: "My Orders" },
    { id: "requests", icon: "♡", label: "Book Wish Board" },
    { id: "offers", icon: "◇", label: "Buyer Offers" },
    { id: "profile", icon: "◉", label: "My Profile" },
];

function AppSidebar({ activePage, onNavigate }) {
    const activeItem = activePage === "details" ? "products"
        : activePage === "checkout" ? "cart"
        : activePage === "order-success" ? "orders"
        : activePage;

    return <aside className="app-sidebar">
        <div className="app-sidebar-brand">
            <span>S</span>
            <div>
                <strong>Student<span>Mart</span></strong>
                <small>Your campus marketplace</small>
            </div>
        </div>
        <p className="app-sidebar-caption">MAIN MENU</p>
        <nav className="app-sidebar-nav" aria-label="Main navigation">
            {items.map((item) => <button
                key={item.id}
                type="button"
                className={`app-sidebar-item${activeItem === item.id ? " active" : ""}`}
                aria-current={activeItem === item.id ? "page" : undefined}
                onClick={() => onNavigate(item.id)}
            ><span className="app-sidebar-icon">{item.icon}</span><span>{item.label}</span></button>)}
        </nav>
    </aside>;
}

export default AppSidebar;
