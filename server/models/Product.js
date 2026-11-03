const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        author: { type: String, trim: true, default: "", maxlength: 120 },
        genreBadge: { type: String, trim: true, default: "", maxlength: 80 },
        semesterTag: { type: String, trim: true, default: "", maxlength: 80 },
        originalPrice: { type: Number, min: 0, default: 0 },
        rentPrice: { type: Number, min: 0, default: 0 },
        pickup: { type: String, trim: true, default: "", maxlength: 160 },
        allowSwap: { type: Boolean, default: false },
        views: { type: Number, min: 0, default: 0 },

        description: {
            type: String,
            required: true,
            trim: true
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        image: {
            type: String,
            trim: true,
            default: ""
        },
        imageCreditUrl: { type: String, trim: true, default: "" },

        seedKey: { type: String, trim: true, default: "", index: true },

        stock: {
            type: Number,
            min: 0,
            default: 0
        },

        condition: {
            type: String,
            required: true,
            enum: ["New", "Like New", "Good", "Used", "Read Once"]
        },

        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Product", productSchema);
