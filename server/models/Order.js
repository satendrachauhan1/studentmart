const mongoose = require("mongoose");


// =====================================================
// ORDER ITEM
// =====================================================

const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false
        },

        title: {
            type: String,
            required: true
        },

        price: {
            type: Number,
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        purchaseType: { type: String, enum: ["buy", "rent"], default: "buy" },

        subtotal: {
            type: Number,
            required: true
        }
    },
    {
        _id: false
    }
);


// =====================================================
// DELIVERY ADDRESS
// =====================================================

const addressSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true
        },

        phone: {
            type: String,
            required: true
        },

        address: {
            type: String,
            required: true
        },

        city: {
            type: String,
            required: true
        },

        state: {
            type: String,
            required: true
        },

        pincode: {
            type: String,
            required: true
        }
    },
    {
        _id: false
    }
);


// =====================================================
// ORDER
// =====================================================

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        customer: {
            fullName: {
                type: String,
                required: true
            },

            email: {
                type: String,
                required: true
            },

            phone: {
                type: String,
                required: true
            }
        },

        deliveryAddress: {
            type: addressSchema,
            required: true
        },

        items: {
            type: [orderItemSchema],
            required: true
        },

        totalAmount: {
            type: Number,
            required: true
        },

        status: {
            type: String,
            enum: [
                "Pending",
                "Confirmed",
                "Processing",
                "Shipped",
                "Delivered",
                "Cancelled"
            ],
            default: "Pending"
        },

        orderDate: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);


module.exports = mongoose.model(
    "Order",
    orderSchema
);
