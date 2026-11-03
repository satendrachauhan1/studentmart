import { useEffect, useState } from "react";
import { handleProductImageError, productImageFallback } from "../utils/productImage.js";

function ProductDetails({ product, onBack, onCart, onOffers }) {
    const [addingToCart, setAddingToCart] = useState(false);
    const [cartedTypes, setCartedTypes] = useState([]);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [showContact, setShowContact] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [showOffer, setShowOffer] = useState(false);
    const [offerPrice, setOfferPrice] = useState("");
    const [offerMessage, setOfferMessage] = useState("");
    const [offerStatus, setOfferStatus] = useState("");
    const [sendingOffer, setSendingOffer] = useState(false);

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!product?._id || !token) return;
        fetch(`${import.meta.env.VITE_API_URL || ""}/api/saved-products`, { headers: { Authorization: `Bearer ${token}` } })
            .then((response) => response.ok ? response.json() : { products: [] })
            .then((data) => setIsSaved((data.products || []).some((item) => item._id === product._id)))
            .catch(() => setIsSaved(false));
    }, [product?._id, token]);

    useEffect(() => {
        if (!product?._id) return;
        fetch(`${import.meta.env.VITE_API_URL || ""}/api/products/${product._id}/view`, { method: "POST" }).catch(() => {});
    }, [product?._id]);

    useEffect(() => {
        if (!product?._id || !token) return;
        fetch(`${import.meta.env.VITE_API_URL || ""}/api/cart`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((response) => response.ok ? response.json() : null)
            .then((data) => {
                const items = data?.cart?.items || [];
                setCartedTypes(items
                    .filter((item) => String(item.product?._id || item.product) === String(product._id))
                    .map((item) => item.purchaseType || "buy"));
            })
            .catch(() => {});
    }, [product?._id, token]);

    const toggleSaved = async () => {
        setSaveError("");
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/saved-products/${product._id}`, {
                method: isSaved ? "DELETE" : "POST", headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Unable to update saved items");
            setIsSaved(!isSaved);
        } catch (err) { setSaveError(err.message); }
    };

    const submitOffer = async (event) => {
        event.preventDefault();
        setOfferStatus("");
        setSendingOffer(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/product-offers`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ productId: product._id, offerPrice, message: offerMessage, pickupProposal: product.pickup || "" })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Unable to send offer");
            setOfferStatus("Your offer was sent to the seller.");
            setShowOffer(false);
            setOfferPrice("");
            setOfferMessage("");
        } catch (err) { setOfferStatus(err.message); }
        finally { setSendingOffer(false); }
    };

    if (!product) {
        return (
            <div className="product-details-page">
                <div className="product-not-found">
                    <div className="not-found-icon">📦</div>
                    <h2>Product not found</h2>
                    <p>The product you're looking for is no longer available.</p>

                    <button
                        className="back-products-button"
                        onClick={onBack}
                    >
                        ← Back to Products
                    </button>
                </div>
            </div>
        );
    }

    const sellerName =
        product.seller?.name ||
        product.seller?.username ||
        "StudentMart Seller";

    const sellerEmail = product.seller?.email || "";

    const firstLetter = sellerName.charAt(0).toUpperCase();

    const handleAddToCart = async (purchaseType = "buy") => {
        // React passes its click event to a directly assigned handler; only send
        // the supported string value to JSON/API requests.
        const selectedPurchaseType = purchaseType === "rent" ? "rent" : "buy";
        if (cartedTypes.includes(selectedPurchaseType)) {
            onCart?.();
            return;
        }
        if (!token) {
            setError("Please login first.");
            return;
        }

        try {
            setAddingToCart(true);
            setMessage("");
            setError("");

            const response = await fetch(
                `${import.meta.env.VITE_API_URL || ""}/api/cart`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        productId: product._id,
                        quantity: 1,
                        purchaseType: selectedPurchaseType
                    })
                }
            );

            const text = await response.text();

            let data = {};

            try {
                data = text ? JSON.parse(text) : {};
            } catch {
                throw new Error("Invalid response from server.");
            }

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to add product to cart."
                );
            }

            setMessage(selectedPurchaseType === "rent" ? "Weekly rental added to your cart." : "Product added to cart successfully.");
            setCartedTypes((current) => current.includes(selectedPurchaseType) ? current : [...current, selectedPurchaseType]);
        } catch (err) {
            console.error("ADD TO CART ERROR:", err);
            setError(err.message);
        } finally {
            setAddingToCart(false);
        }
    };

    const handleBuyNow = async () => {
        if (!token) {
            setError("Please login first.");
            return;
        }

        try {
            setAddingToCart(true);
            setMessage("");
            setError("");

            const response = await fetch(
                `${import.meta.env.VITE_API_URL || ""}/api/cart`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        productId: product._id,
                        quantity: 1,
                        purchaseType: "buy"
                    })
                }
            );

            const text = await response.text();

            let data = {};

            try {
                data = text ? JSON.parse(text) : {};
            } catch {
                throw new Error("Invalid response from server.");
            }

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to add product to cart."
                );
            }

            // Go directly to cart after adding.
            if (onCart) {
                onCart();
            }
        } catch (err) {
            console.error("BUY NOW ERROR:", err);
            setError(err.message);
        } finally {
            setAddingToCart(false);
        }
    };

    return (
        <div className="product-details-page">

            {/* HEADER */}
            <header className="product-details-header">
                <button
                    className="product-back-button"
                    onClick={onBack}
                >
                    <span>←</span>
                    Back to Products
                </button>

                <div className="product-details-brand">
                    <div className="brand-logo">S</div>

                    <div>
                        <h2>
                            Student<span>Mart</span>
                        </h2>

                        <p>Campus Marketplace</p>
                    </div>
                </div>

                <button className="products-cart-button" type="button" onClick={onCart}>🛒 View cart</button>
            </header>

            {/* MAIN PRODUCT */}
            <main className="product-details-container">

                <div className="product-details-card">

                    {/* PRODUCT IMAGE */}
                    <div className="product-details-image">
                        <div className="product-image-background">
                            <img src={product.image || productImageFallback(product)} alt={product.title} className="product-large-image" onError={(event) => handleProductImageError(event, product)} />
                        </div>

                        <div className="image-badge">
                            {product.condition || "Good Condition"}
                        </div>
                        {product.imageCreditUrl && <a className="product-image-credit" href={product.imageCreditUrl} target="_blank" rel="noreferrer">Cover source: Open Library</a>}
                    </div>

                    {/* PRODUCT INFORMATION */}
                    <div className="product-details-info">

                        <div className="product-top-info">
                            <span className="product-category">
                                {product.category || "Other"}
                            </span>

                            <span className="available-badge">
                                ● {product.stock > 0 ? `${product.stock} available` : "Available"}
                            </span>
                        </div>

                        <h1 className="product-title">
                            {product.title}
                        </h1>

                        {product.author && <p className="product-author-details">by {product.author}</p>}

                        <div className="product-price">
                            ₹{Number(product.price || 0).toLocaleString("en-IN")}
                        </div>

                        <div className="product-condition-box">
                            <div className="condition-item">
                                <span className="condition-icon">✓</span>

                                <div>
                                    <small>Condition</small>
                                    <strong>
                                        {product.condition || "Not specified"}
                                    </strong>
                                </div>
                            </div>

                            <div className="condition-divider"></div>

                            <div className="condition-item">
                                <span className="condition-icon">🛡</span>

                                <div>
                                    <small>Marketplace</small>
                                    <strong>StudentMart</strong>
                                </div>
                            </div>

                            <div className="condition-divider"></div>
                            <div className="condition-item">
                                <span className="condition-icon">▦</span>
                                <div><small>Available stock</small><strong>{product.stock ?? "Not specified"}</strong></div>
                            </div>
                        </div>

                        {(product.originalPrice > product.price || product.semesterTag || product.pickup || product.allowSwap) && <div className="product-metadata-row">
                            {product.originalPrice > product.price && <span>Original price <strong>₹{product.originalPrice}</strong></span>}
                            {product.genreBadge && <span className="product-genre-badge">{product.genreBadge}</span>}
                            {product.semesterTag && <span>{product.semesterTag}</span>}
                            {product.pickup && <span>Pickup: {product.pickup}</span>}
                            {product.allowSwap && <span className="swap-available-badge">Open to swaps</span>}
                        </div>}

                        {/* DESCRIPTION */}
                        <section className="product-description">
                            <h2>Description</h2>

                            <p>
                                {product.description ||
                                    "No description provided by the seller."}
                            </p>
                        </section>

                        {/* SELLER */}
                        <section className="seller-section">

                            <h2>Seller</h2>

                            <div className="seller-card">

                                <div className="seller-avatar">
                                    {firstLetter}
                                </div>

                                <div className="seller-info">
                                    <strong>{sellerName}</strong>

                                    <span>
                                        Verified StudentMart Seller
                                    </span>

                                    {sellerEmail && (
                                        <small>{sellerEmail}</small>
                                    )}
                                </div>

                                <button
                                    className="contact-seller-button"
                                    onClick={() =>
                                        setShowContact(true)
                                    }
                                >
                                    {product.allowSwap ? "Contact / Swap" : "Contact Seller"}
                                </button>

                            </div>

                        </section>

                        {/* MESSAGES */}
                        {message && (
                            <div className="product-success-message">
                                <span>✓</span>
                                {message}
                            </div>
                        )}

                        {error && (
                            <div className="product-error-message">
                                <span>!</span>
                                {error}
                            </div>
                        )}
                        {saveError && <div className="product-error-message" role="alert">{saveError}</div>}
                        {offerStatus && <div className={offerStatus.startsWith("Your offer") ? "product-success-message" : "product-error-message"} role="status">{offerStatus}</div>}

                        {showOffer && <form className="buyer-offer-form" onSubmit={submitOffer}>
                            <label>Your offer (₹)<input type="number" min="0" step="1" required value={offerPrice} onChange={(event) => setOfferPrice(event.target.value)} placeholder={`Listed price ₹${Number(product.price || 0)}`} /></label>
                            <label>Message to seller (optional)<textarea maxLength="500" value={offerMessage} onChange={(event) => setOfferMessage(event.target.value)} placeholder="Add a short note" /></label>
                            <div><button type="submit" disabled={sendingOffer}>{sendingOffer ? "Sending…" : "Send offer"}</button><button type="button" onClick={() => setShowOffer(false)}>Cancel</button></div>
                        </form>}

                        {/* ACTION BUTTONS */}
                        <div className="product-actions">

                            {String(product.seller?._id || product.seller) !== String(JSON.parse(localStorage.getItem("user") || "{}")?._id || JSON.parse(localStorage.getItem("user") || "{}")?.id) && <button className="save-detail-button" type="button" onClick={() => setShowOffer((value) => !value)}>{showOffer ? "Close offer" : "Make an offer"}</button>}

                            <button
                                className="add-cart-button"
                                onClick={() => cartedTypes.includes("buy") ? onCart?.() : handleAddToCart("buy")}
                                disabled={addingToCart}
                            >
                                {addingToCart ? (
                                    <>
                                        <span className="button-spinner"></span>
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <span>🛒</span>
                                        {cartedTypes.includes("buy") ? "Go to Cart" : "Add to Cart"}
                                    </>
                                )}
                            </button>

                            <button
                                className="buy-now-button"
                                onClick={handleBuyNow}
                                disabled={addingToCart}
                            >
                                {addingToCart
                                    ? "Processing..."
                                    : "Buy Now"}
                            </button>

                            {product.rentPrice > 0 && <button className="rent-product-button" onClick={() => cartedTypes.includes("rent") ? onCart?.() : handleAddToCart("rent")} disabled={addingToCart}>{cartedTypes.includes("rent") ? "Go to Cart" : `Rent · ₹${product.rentPrice}/week`}</button>}

                            <button className="save-detail-button" onClick={toggleSaved} type="button">{isSaved ? "♥ Saved" : "♡ Save item"}</button>

                        </div>

                    </div>
                </div>

                {/* TRUST INFORMATION */}
                <div className="product-trust-section">

                    <div className="trust-item">
                        <div className="trust-icon">🔒</div>

                        <div>
                            <strong>Secure Shopping</strong>
                            <span>Your account is protected.</span>
                        </div>
                    </div>

                    <div className="trust-item">
                        <div className="trust-icon">🎓</div>

                        <div>
                            <strong>Student Marketplace</strong>
                            <span>Built for campus students.</span>
                        </div>
                    </div>

                    <div className="trust-item">
                        <div className="trust-icon">🤝</div>

                        <div>
                            <strong>Connect Directly</strong>
                            <span>Contact sellers easily.</span>
                        </div>
                    </div>

                </div>

            </main>

            {/* CONTACT MODAL */}
            {showContact && (
                <div
                    className="contact-modal-overlay"
                    onClick={() => setShowContact(false)}
                >
                    <div
                        className="contact-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <button
                            className="contact-close"
                            onClick={() => setShowContact(false)}
                        >
                            ×
                        </button>

                        <div className="contact-modal-icon">
                            👤
                        </div>

                        <h2>Contact Seller</h2>

                        <p>
                            You can contact the seller using the
                            information below.
                        </p>

                        <div className="contact-seller-info">

                            <div className="modal-avatar">
                                {firstLetter}
                            </div>

                            <div>
                                <strong>{sellerName}</strong>

                                <span>
                                    StudentMart Seller
                                </span>
                            </div>

                        </div>

                        {sellerEmail ? (
                            <a
                                className="email-seller-button"
                                href={`mailto:${sellerEmail}?subject=StudentMart Product Inquiry - ${product.title}`}
                            >
                                ✉ Email Seller
                            </a>
                        ) : (
                            <div className="no-email">
                                Seller email is not available.
                            </div>
                        )}

                    </div>
                </div>
            )}

        </div>
    );
}

export default ProductDetails;
