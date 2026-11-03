const express = require("express");
const mongoose = require("mongoose");

const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// PLACE ORDER
// POST /api/orders
// =====================================================

router.post("/", authMiddleware, async (req, res) => {

    try {

        const {
            fullName,
            email,
            phone,
            address,
            city,
            state,
            pincode,
            cartItemKeys
        } = req.body;


        // =================================================
        // VALIDATE CUSTOMER DETAILS
        // =================================================

        if (
            !fullName ||
            !email ||
            !phone ||
            !address ||
            !city ||
            !state ||
            !pincode
        ) {

            return res.status(400).json({
                message:
                    "Please fill all customer and delivery details"
            });

        }


        // =================================================
        // GET USER CART
        // =================================================

        const cart = await Cart.findOne({
            user: req.user.id
        }).populate(
            "items.product",
            "title price rentPrice seller"
        );


        if (!cart || cart.items.length === 0) {

            return res.status(400).json({
                message:
                    "Your cart is empty"
            });

        }

        const selectedCartItems = Array.isArray(cartItemKeys)
            ? cart.items.filter((item) => cartItemKeys.includes(`${item.product?._id || item.product}:${item.purchaseType || "buy"}`))
            : cart.items;

        if (selectedCartItems.length === 0) {
            return res.status(400).json({ message: "Select at least one cart item to checkout" });
        }


        // =================================================
        // PREPARE ORDER ITEMS
        // =================================================

        const orderItems = selectedCartItems.map((item) => {

            const product = item.product;

            const purchaseType = item.purchaseType || "buy";
            const price = purchaseType === "rent" ? Number(product.rentPrice) : Number(product.price);

            const quantity = Number(item.quantity);

            return {

                product: product._id,

                seller: product.seller,

                title: purchaseType === "rent" ? `${product.title} (weekly rental)` : product.title,

                purchaseType,

                price: price,

                quantity: quantity,

                subtotal:
                    price * quantity

            };

        });


        // =================================================
        // CALCULATE TOTAL
        // =================================================

        const totalAmount = orderItems.reduce(
            (total, item) =>
                total + item.subtotal,
            0
        );


        // =================================================
        // CREATE ORDER
        // =================================================

        const order = await Order.create({

            user: req.user.id,

            customer: {

                fullName,

                email,

                phone

            },

            deliveryAddress: {

                fullName,

                phone,

                address,

                city,

                state,

                pincode

            },

            items: orderItems,

            totalAmount,

            // Every new order starts as Pending
            status: "Pending"

        });


        // =================================================
        // CLEAR CART AFTER ORDER
        // =================================================

        const placedCartKeys = new Set(selectedCartItems.map((item) => `${item.product?._id || item.product}:${item.purchaseType || "buy"}`));
        cart.items = cart.items.filter((item) => !placedCartKeys.has(`${item.product?._id || item.product}:${item.purchaseType || "buy"}`));

        await cart.save();


        // =================================================
        // RESPONSE
        // =================================================

        res.status(201).json({

            message:
                "Order placed successfully",

            order

        });


    } catch (error) {

        console.error(
            "PLACE ORDER ERROR:",
            error
        );


        res.status(500).json({

            message:
                "Unable to place order",

            error:
                error.message

        });

    }

});


// =====================================================
// GET USER ORDERS
// GET /api/orders
// =====================================================

router.get("/", authMiddleware, async (req, res) => {

    try {

        const orders =
            await Order.find({
                user: req.user.id
            })
            .populate(
                "items.product",
                "title price rentPrice category image originalPrice pickup"
            )
            .sort({
                createdAt: -1
            });


        res.status(200).json({

            orders

        });


    } catch (error) {

        console.error(
            "GET ORDERS ERROR:",
            error
        );


        res.status(500).json({

            message:
                "Unable to load orders",

            error:
                error.message

        });

    }

});

// Orders containing products listed by the signed-in seller.
router.get("/incoming", authMiddleware, async (req, res) => {
    try {
        const sellerProducts = await Product.find({ seller: req.user.id }).distinct("_id");
        const sellerMatch = sellerProducts.length
            ? { $or: [{ "items.seller": req.user.id }, { "items.product": { $in: sellerProducts } }] }
            : { "items.seller": req.user.id };
        const orders = await Order.find({ ...sellerMatch, status: { $in: ["Pending", "Confirmed"] } })
            .populate("user", "name email")
            .populate("items.product", "title price rentPrice category image pickup seller")
            .sort({ createdAt: -1 })
            .limit(20);
        const sellerOrders = orders.map((order) => {
            const data = order.toObject();
            data.id = String(order._id);
            data.sellerItems = data.items.filter((item) => String(item.seller || item.product?.seller?._id || item.product?.seller) === String(req.user.id));
            return data;
        }).filter((order) => order.sellerItems.length > 0);
        res.json({ orders: sellerOrders });
    } catch (error) {
        console.error("Load incoming seller orders error:", error);
        res.status(500).json({ message: "Unable to load incoming orders" });
    }
});

// Sellers can confirm pending orders only when the order contains one of their listings.
router.put("/incoming/:orderId/confirm", authMiddleware, async (req, res) => {
    try {
        const orderId = String(req.params.orderId || "").trim();
        if (!/^[a-f\d]{24}$/i.test(orderId)) return res.status(400).json({ message: "Invalid order ID" });
        const order = await Order.findById(orderId)
            .populate("user", "name email")
            .populate("items.product", "title price rentPrice category image pickup seller");
        if (!order) return res.status(404).json({ message: "Order not found" });
        const sellerItems = order.items.filter((item) => String(item.seller || item.product?.seller?._id || item.product?.seller) === String(req.user.id));
        if (!sellerItems.length) return res.status(403).json({ message: "You can only confirm orders that contain your listings" });
        if (order.status !== "Pending") return res.status(409).json({ message: `This order is ${order.status.toLowerCase()} and cannot be confirmed` });
        order.status = "Confirmed";
        await order.save();
        const data = order.toObject();
        data.id = String(order._id);
        data.sellerItems = sellerItems;
        res.json({ message: "Order confirmed", order: data });
    } catch (error) {
        console.error("Confirm seller order error:", error);
        res.status(500).json({ message: "Unable to confirm order" });
    }
});


// =====================================================
// GET SINGLE ORDER
// GET /api/orders/:orderId
// =====================================================

router.get(
    "/:orderId",
    authMiddleware,
    async (req, res) => {

        try {

            const {
                orderId
            } = req.params;


            // Validate MongoDB ID

            if (
                !mongoose.Types.ObjectId.isValid(
                    orderId
                )
            ) {

                return res.status(400).json({

                    message:
                        "Invalid order ID"

                });

            }


            const order =
                await Order.findOne({

                    _id: orderId,

                    user: req.user.id

                })
                .populate(
                    "items.product",
                    "title price rentPrice category condition"
                );


            if (!order) {

                return res.status(404).json({

                    message:
                        "Order not found"

                });

            }


            res.status(200).json({

                order

            });


        } catch (error) {

            console.error(
                "GET ORDER ERROR:",
                error
            );


            res.status(500).json({

                message:
                    "Unable to load order",

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// CONFIRM ORDER
// PUT /api/orders/:orderId/confirm
// =====================================================

router.put(
    "/:orderId/confirm",
    authMiddleware,
    async (req, res) => {

        try {

            const {
                orderId
            } = req.params;


            // =================================================
            // VALIDATE ORDER ID
            // =================================================

            if (
                !mongoose.Types.ObjectId.isValid(
                    orderId
                )
            ) {

                return res.status(400).json({

                    message:
                        "Invalid order ID"

                });

            }


            // =================================================
            // FIND USER ORDER
            // =================================================

            const order =
                await Order.findOne({

                    _id: orderId,

                    user: req.user.id

                });


            if (!order) {

                return res.status(404).json({

                    message:
                        "Order not found"

                });

            }


            // =================================================
            // CHECK CURRENT STATUS
            // =================================================

            if (order.status === "Confirmed") {

                return res.status(400).json({

                    message:
                        "Order is already confirmed",

                    order

                });

            }


            if (order.status === "Cancelled") {

                return res.status(400).json({

                    message:
                        "Cancelled orders cannot be confirmed"

                });

            }


            if (order.status === "Delivered") {

                return res.status(400).json({

                    message:
                        "Delivered order is already completed"

                });

            }


            if (order.status !== "Pending") {

                return res.status(400).json({

                    message:
                        `Order cannot be confirmed because its current status is ${order.status}`

                });

            }


            // =================================================
            // CHANGE STATUS
            // =================================================

            order.status = "Confirmed";

            await order.save();


            // =================================================
            // RESPONSE
            // =================================================

            res.status(200).json({

                message:
                    "Order confirmed successfully",

                order

            });


        } catch (error) {

            console.error(
                "CONFIRM ORDER ERROR:",
                error
            );


            res.status(500).json({

                message:
                    "Unable to confirm order",

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// UPDATE ORDER STATUS
// PUT /api/orders/:orderId/status
// =====================================================

router.put(
    "/:orderId/status",
    authMiddleware,
    async (req, res) => {

        try {

            const {
                orderId
            } = req.params;

            const {
                status
            } = req.body;


            // =================================================
            // VALIDATE ORDER ID
            // =================================================

            if (
                !mongoose.Types.ObjectId.isValid(
                    orderId
                )
            ) {

                return res.status(400).json({

                    message:
                        "Invalid order ID"

                });

            }


            // =================================================
            // VALIDATE STATUS
            // =================================================

            const allowedStatuses = [
                "Pending",
                "Confirmed",
                "Processing",
                "Shipped",
                "Delivered",
                "Cancelled"
            ];


            if (
                !allowedStatuses.includes(status)
            ) {

                return res.status(400).json({

                    message:
                        "Invalid order status"

                });

            }


            // =================================================
            // FIND ORDER
            // =================================================

            const order =
                await Order.findOne({

                    _id: orderId,

                    user: req.user.id

                });


            if (!order) {

                return res.status(404).json({

                    message:
                        "Order not found"

                });

            }


            // =================================================
            // PREVENT CHANGES TO DELIVERED ORDER
            // =================================================

            if (
                order.status === "Delivered"
            ) {

                return res.status(400).json({

                    message:
                        "Delivered orders cannot be changed"

                });

            }


            // =================================================
            // PREVENT CHANGES TO CANCELLED ORDER
            // =================================================

            if (
                order.status === "Cancelled" &&
                status !== "Cancelled"
            ) {

                return res.status(400).json({

                    message:
                        "Cancelled orders cannot be changed"

                });

            }


            // =================================================
            // UPDATE STATUS
            // =================================================

            order.status = status;

            await order.save();


            // =================================================
            // RESPONSE
            // =================================================

            res.status(200).json({

                message:
                    `Order status updated to ${status}`,

                order

            });


        } catch (error) {

            console.error(
                "UPDATE ORDER STATUS ERROR:",
                error
            );


            res.status(500).json({

                message:
                    "Unable to update order status",

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// CANCEL ORDER
// PUT /api/orders/:orderId/cancel
// =====================================================

router.put(
    "/:orderId/cancel",
    authMiddleware,
    async (req, res) => {

        try {

            const order =
                await Order.findOne({

                    _id:
                        req.params.orderId,

                    user:
                        req.user.id

                });


            if (!order) {

                return res.status(404).json({

                    message:
                        "Order not found"

                });

            }


            // =================================================
            // DELIVERED ORDER
            // =================================================

            if (
                order.status === "Delivered"
            ) {

                return res.status(400).json({

                    message:
                        "Delivered orders cannot be cancelled"

                });

            }


            // =================================================
            // ALREADY CANCELLED
            // =================================================

            if (
                order.status === "Cancelled"
            ) {

                return res.status(400).json({

                    message:
                        "Order is already cancelled"

                });

            }


            // =================================================
            // CANCEL ORDER
            // =================================================

            order.status = "Cancelled";

            await order.save();


            res.status(200).json({

                message:
                    "Order cancelled successfully",

                order

            });


        } catch (error) {

            console.error(
                "CANCEL ORDER ERROR:",
                error
            );


            res.status(500).json({

                message:
                    "Unable to cancel order",

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;
