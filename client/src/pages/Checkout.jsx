import { useEffect, useState } from "react";
import { apiUrl } from "../utils/api.js";

function Checkout({ onBack, onOrderPlaced, selectedCartKeys = [] }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: ""
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCart();
  }, [selectedCartKeys]);

  const fetchCart = async () => {
    try {
      const response = await fetch(apiUrl("cart"), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const text = await response.text();

      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(
          `Cart server returned invalid response: ${text.slice(0, 200)}`
        );
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to load cart");
      }

      const selectedItems = data.cart?.items?.filter((item) => selectedCartKeys.includes(`${item.product?._id || item.product}:${item.purchaseType || "buy"}`)) || [];
      setCart({ ...data.cart, items: selectedItems });
    } catch (err) {
      console.error("CART ERROR:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getTotal = () => {
    if (!cart?.items) return 0;

    return cart.items.reduce((total, item) => {
      const price = item.purchaseType === "rent" ? item.product.rentPrice : item.product.price;
      return total + price * item.quantity;
    }, 0);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    setError("");
    setPlacingOrder(true);

    try {
      const response = await fetch(apiUrl("orders"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, cartItemKeys: selectedCartKeys })
      });

      // Read response as TEXT first
      const text = await response.text();

      console.log("ORDER STATUS:", response.status);
      console.log("ORDER RAW RESPONSE:", text);

      let data;

      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error("JSON PARSE ERROR:", parseError);

        throw new Error(
          `Order server returned invalid response (${response.status}): ${text.slice(
            0,
            300
          )}`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `Order failed with status ${response.status}`
        );
      }

      if (!data.order) {
        throw new Error(
          data.message || "Order was processed but no order data was returned."
        );
      }

      console.log("ORDER SUCCESS:", data);

      onOrderPlaced(data.order);
    } catch (err) {
      console.error("PLACE ORDER ERROR:", err);

      setError(err.message || "Unable to place order");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="checkout-status">
          <div className="checkout-spinner"></div>
          <p>Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-status">
          <div className="checkout-empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add products before proceeding to checkout.</p>

          <button
            className="checkout-back-button"
            onClick={onBack}
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">

      <div className="checkout-header">
        <button
          className="checkout-back-button"
          onClick={onBack}
        >
          ← Back to Cart
        </button>

        <div>
          <h1>Checkout</h1>
          <p>Complete your details to place your order</p>
        </div>
      </div>

      <div className="checkout-layout">

        <form
          className="checkout-form"
          onSubmit={handlePlaceOrder}
        >

          <section className="checkout-section">
            <h2>Customer Details</h2>

            <div className="checkout-grid">

              <div className="checkout-field">
                <label>Full Name</label>

                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="checkout-field">
                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="checkout-field">
                <label>Phone</label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                />
              </div>

            </div>
          </section>

          <section className="checkout-section">
            <h2>Delivery Address</h2>

            <div className="checkout-field">
              <label>Address</label>

              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="House no., street, area"
                rows="3"
                required
              />
            </div>

            <div className="checkout-grid">

              <div className="checkout-field">
                <label>City</label>

                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                />
              </div>

              <div className="checkout-field">
                <label>State</label>

                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  required
                />
              </div>

              <div className="checkout-field">
                <label>Pincode</label>

                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="6-digit pincode"
                  required
                />
              </div>

            </div>
          </section>

          {error && (
            <div className="checkout-error">
              <strong>Order Error</strong>
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="place-order-button"
            disabled={placingOrder}
          >
            {placingOrder
              ? "Placing Order..."
              : `Place Order • ₹${getTotal().toFixed(2)}`}
          </button>

        </form>

        <aside className="checkout-summary">

          <h2>Order Summary</h2>

          <div className="checkout-summary-items">

            {cart.items.map((item) => (
              <div
                className="checkout-summary-item"
                key={`${item.product._id}:${item.purchaseType || "buy"}`}
              >
                <div>
                  <h3>{item.product.title}</h3>

                  <p>
                    {item.purchaseType === "rent" ? "Rent / week · " : ""}₹{item.purchaseType === "rent" ? item.product.rentPrice : item.product.price} × {item.quantity}
                  </p>
                </div>

                <strong>
                  ₹{(
                    (item.purchaseType === "rent" ? item.product.rentPrice : item.product.price) * item.quantity
                  ).toFixed(2)}
                </strong>
              </div>
            ))}

          </div>

          <div className="checkout-summary-divider"></div>

          <div className="checkout-summary-row">
            <span>Subtotal</span>
            <strong>₹{getTotal().toFixed(2)}</strong>
          </div>

          <div className="checkout-summary-row">
            <span>Delivery</span>
            <strong>Free</strong>
          </div>

          <div className="checkout-summary-divider"></div>

          <div className="checkout-total">
            <span>Total</span>
            <strong>₹{getTotal().toFixed(2)}</strong>
          </div>

        </aside>

      </div>

    </div>
  );
}

export default Checkout;
