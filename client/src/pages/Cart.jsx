import { useEffect, useState } from "react";
import { apiUrl } from "../utils/api.js";

function Cart({
    onBack,
    onCheckout
}) {

    const [cart, setCart] = useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [updatingProduct, setUpdatingProduct] =
        useState(null);
    const [selectedCartKeys, setSelectedCartKeys] = useState([]);

    const token =
        localStorage.getItem("token");

    const getCartKey = (item) => `${item.product?._id || item.product}:${item.purchaseType || "buy"}`;


    // =====================================================
    // LOAD CART
    // =====================================================

    useEffect(() => {
        loadCart();
    }, []);


    const loadCart = async () => {

        try {

            setLoading(true);
            setError("");


            const response =
                await fetch(
                    apiUrl("cart"),
                    {
                        method: "GET",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            const text =
                await response.text();


            let data = {};

            try {

                data = text
                    ? JSON.parse(text)
                    : {};

            } catch {

                throw new Error(
                    "Invalid response from cart server."
                );

            }


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to load cart."
                );

            }


            const loadedCart = data.cart || { items: [] };
            setCart(loadedCart);
            setSelectedCartKeys((current) => current.length ? current.filter((key) => loadedCart.items.some((item) => getCartKey(item) === key)) : loadedCart.items.map(getCartKey));

        } catch (error) {

            console.error(
                "LOAD CART ERROR:",
                error
            );

            setError(
                error.message
            );

        } finally {

            setLoading(false);

        }
    };


    // =====================================================
    // UPDATE QUANTITY
    // =====================================================

    const updateQuantity = async (
        productId,
        quantity
    ) => {

        if (quantity < 1) {
            return;
        }


        try {

            setUpdatingProduct(
                productId
            );


            const response =
                await fetch(
                    apiUrl(`cart/${productId}`),
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            quantity
                        })
                    }
                );


            const text =
                await response.text();


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
                    "Unable to update quantity."
                );

            }


            setCart(
                data.cart
            );
            setSelectedCartKeys((current) => current.filter((key) => data.cart.items.some((item) => getCartKey(item) === key)));

        } catch (error) {

            console.error(
                "UPDATE QUANTITY ERROR:",
                error
            );

            setError(
                error.message
            );

        } finally {

            setUpdatingProduct(
                null
            );

        }
    };


    // =====================================================
    // REMOVE PRODUCT
    // =====================================================

    const removeProduct = async (
        productId
    ) => {

        try {

            setUpdatingProduct(
                productId
            );


            const response =
                await fetch(
                    apiUrl(`cart/${productId}`),
                    {
                        method: "DELETE",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            const text =
                await response.text();


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
                    "Unable to remove product."
                );

            }


            setCart(
                data.cart
            );
            setSelectedCartKeys((current) => current.filter((key) => data.cart.items.some((item) => getCartKey(item) === key)));

        } catch (error) {

            console.error(
                "REMOVE PRODUCT ERROR:",
                error
            );

            setError(
                error.message
            );

        } finally {

            setUpdatingProduct(
                null
            );

        }
    };


    // =====================================================
    // CALCULATE TOTALS
    // =====================================================

    const items =
        cart?.items || [];

    const selectedItems = items.filter((item) => selectedCartKeys.includes(getCartKey(item)));
    const allSelected = items.length > 0 && selectedItems.length === items.length;
    const toggleCartItem = (item) => {
        const key = getCartKey(item);
        setSelectedCartKeys((current) => current.includes(key) ? current.filter((selectedKey) => selectedKey !== key) : [...current, key]);
    };
    const toggleAllCartItems = () => setSelectedCartKeys(allSelected ? [] : items.map(getCartKey));


    const totalItems =
        selectedItems.reduce(
            (total, item) =>
                total +
                Number(item.quantity || 0),
            0
        );


    const subtotal =
        items.reduce(
            (total, item) => {

                const price = Number(item.purchaseType === "rent" ? item.product?.rentPrice || 0 : item.product?.price || 0);

                const quantity =
                    Number(
                        item.quantity || 0
                    );

                return (
                    total +
                    price * quantity
                );

            },
            0
        );


    const deliveryCharge =
        selectedItems.length > 0
            ? 0
            : 0;


    const totalAmount =
        subtotal +
        deliveryCharge;


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="cart-page">

                <div className="cart-loading">

                    <div className="cart-spinner"></div>

                    <p>
                        Loading your cart...
                    </p>

                </div>

            </div>
        );

    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error && !cart) {

        return (
            <div className="cart-page">

                <div className="cart-error">

                    <div className="cart-error-icon">
                        !
                    </div>

                    <h2>
                        Unable to load cart
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        onClick={loadCart}
                    >
                        Try Again
                    </button>

                </div>

            </div>
        );

    }


    // =====================================================
    // MAIN CART
    // =====================================================

    return (
        <div className="cart-page">

            {/* HEADER */}

            <div className="cart-header">

                <div>

                    <button
                        className="cart-back-button"
                        onClick={onBack}
                    >
                        ← Dashboard
                    </button>

                    <h1>
                        Shopping Cart
                    </h1>

                    <p>
                        Review the products
                        you've added.
                    </p>

                </div>

                <div className="cart-item-count">

                    {totalItems}

                    {totalItems === 1
                        ? " Item"
                        : " Items"}

                </div>

            </div>


            {/* ERROR MESSAGE */}

            {error && (
                <div className="cart-warning">
                    {error}
                </div>
            )}


            {/* EMPTY CART */}

            {items.length === 0 ? (

                <div className="cart-empty">

                    <div className="cart-empty-icon">
                        🛒
                    </div>

                    <h2>
                        Your cart is empty
                    </h2>

                    <p>
                        Looks like you haven't
                        added anything yet.
                    </p>

                    <button
                        onClick={onBack}
                    >
                        Continue Shopping
                    </button>

                </div>

            ) : (

                <div className="cart-layout">


                    {/* =================================
                        CART ITEMS
                    ================================= */}

                    <div className="cart-items-section">

                        <div className="cart-section-title">

                            <h2>
                                Cart Items
                            </h2>

                            <span>
                                <label className="cart-select-all"><input type="checkbox" checked={allSelected} onChange={toggleAllCartItems} /> Select all</label>
                                {totalItems}
                                {" "}
                                {totalItems === 1
                                    ? "item"
                                    : "items"}
                            </span>

                        </div>


                        {items.map(
                            (item) => {

                                const product =
                                    item.product;

                                if (!product) {
                                    return null;
                                }


                                const productId =
                                    product._id;


                                const price = Number(item.purchaseType === "rent" ? product.rentPrice || 0 : product.price || 0);


                                const quantity =
                                    Number(
                                        item.quantity || 1
                                    );


                                const itemTotal =
                                    price *
                                    quantity;


                                const isUpdating =
                                    updatingProduct ===
                                    productId;


                                return (

                                    <div
                                        className="cart-item"
                                        key={productId}
                                    >


                                        {/* PRODUCT ICON */}

                                        <div className="cart-product-image">

                                            <span>
                                                📦
                                            </span>

                                        </div>


                                        {/* PRODUCT INFO */}

                                        <div className="cart-product-info">

                                            <label className="cart-item-select"><input type="checkbox" checked={selectedCartKeys.includes(getCartKey(item))} onChange={() => toggleCartItem(item)} /> Select</label>

                                            <h3>
                                                {product.title}
                                            </h3>

                                            {item.purchaseType === "rent" && <p className="cart-rental-label">Weekly rental</p>}

                                            <p>
                                                {product.category ||
                                                    "Product"}
                                            </p>

                                            <span className="cart-condition">
                                                {product.condition ||
                                                    "Good Condition"}
                                            </span>

                                        </div>


                                        {/* PRICE */}

                                        <div className="cart-product-price">

                                            <span>
                                                {item.purchaseType === "rent" ? "Rent / week" : "Price"}
                                            </span>

                                            <strong>
                                                ₹
                                                {price.toFixed(
                                                    2
                                                )}
                                            </strong>

                                        </div>


                                        {/* QUANTITY */}

                                        <div className="quantity-section">

                                            <span>
                                                Quantity
                                            </span>

                                            <div className="quantity-control">

                                                <button
                                                    disabled={
                                                        isUpdating ||
                                                        quantity <= 1
                                                    }
                                                    onClick={() =>
                                                        updateQuantity(
                                                            productId,
                                                            quantity - 1
                                                        )
                                                    }
                                                >
                                                    −
                                                </button>


                                                <strong>
                                                    {quantity}
                                                </strong>


                                                <button
                                                    disabled={
                                                        isUpdating
                                                    }
                                                    onClick={() =>
                                                        updateQuantity(
                                                            productId,
                                                            quantity + 1
                                                        )
                                                    }
                                                >
                                                    +
                                                </button>

                                            </div>

                                        </div>


                                        {/* ITEM TOTAL */}

                                        <div className="cart-item-total">

                                            <span>
                                                Total
                                            </span>

                                            <strong>
                                                ₹
                                                {itemTotal.toFixed(
                                                    2
                                                )}
                                            </strong>

                                        </div>


                                        {/* REMOVE */}

                                        <button
                                            className="remove-cart-button"
                                            disabled={
                                                isUpdating
                                            }
                                            onClick={() =>
                                                removeProduct(
                                                    productId
                                                )
                                            }
                                            title="Remove item"
                                        >
                                            Remove
                                        </button>

                                    </div>

                                );

                            }
                        )}

                    </div>


                    {/* =================================
                        CART SUMMARY
                    ================================= */}

                    <aside className="cart-summary">

                        <h2>
                            Cart Summary
                        </h2>


                        <div className="summary-row">

                            <span>
                                Items
                            </span>

                            <strong>
                                {selectedItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0)} selected
                            </strong>

                        </div>


                        <div className="summary-row">

                            <span>
                                Subtotal
                            </span>

                            <strong>
                                ₹
                                {subtotal.toFixed(
                                    2
                                )}
                            </strong>

                        </div>


                        <div className="summary-row">

                            <span>
                                Delivery
                            </span>

                            <strong className="free-delivery">
                                FREE
                            </strong>

                        </div>


                        <div className="summary-divider"></div>


                        <div className="summary-total">

                            <span>
                                Total Amount
                            </span>

                            <strong>
                                ₹
                                {totalAmount.toFixed(
                                    2
                                )}
                            </strong>

                        </div>


                        <button
                            className="checkout-button"
                            onClick={() => onCheckout(selectedItems.map(getCartKey))}
                            disabled={selectedItems.length === 0}
                        >
                            Proceed to Checkout ({selectedItems.length})
                            <span>
                                →
                            </span>
                        </button>


                        <button
                            className="continue-shopping-button"
                            onClick={onBack}
                        >
                            ← Continue Shopping
                        </button>


                        <div className="cart-security">

                            <span>
                                🔒
                            </span>

                            <p>
                                Your cart is securely
                                saved to your account.
                            </p>

                        </div>

                    </aside>

                </div>

            )}

        </div>
    );
}

export default Cart;
