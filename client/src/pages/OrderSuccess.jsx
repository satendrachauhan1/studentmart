function OrderSuccess({ order, onContinueShopping, onViewOrders }) {
  if (!order) {
    return null;
  }

  return (
    <div className="order-success-overlay">
      <div className="order-success-modal">

        <div className="success-check">
          ✓
        </div>

        <h1>Order Placed Successfully!</h1>

        <p className="success-message">
          Thank you for shopping with StudentMart.
          Your order has been successfully placed.
        </p>

        <div className="order-success-details">

          <div className="success-detail-row">
            <span>Order ID</span>
            <strong>
              #{order._id?.slice(-8).toUpperCase()}
            </strong>
          </div>

          <div className="success-detail-row">
            <span>Order Status</span>
            <strong className="success-status">
              {order.status || "Pending"}
            </strong>
          </div>

          <div className="success-detail-row">
            <span>Total Amount</span>
            <strong>
              ₹{Number(order.totalAmount || 0).toFixed(2)}
            </strong>
          </div>

          <div className="success-detail-row">
            <span>Items</span>
            <strong>
              {order.items?.reduce(
                (total, item) => total + item.quantity,
                0
              ) || 0}
            </strong>
          </div>

        </div>

        <div className="success-actions">

          <button
            className="view-orders-button"
            onClick={onViewOrders}
          >
            View My Orders
          </button>

          <button
            className="continue-shopping-button"
            onClick={onContinueShopping}
          >
            Continue Shopping
          </button>

        </div>

      </div>
    </div>
  );
}

export default OrderSuccess;