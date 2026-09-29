const express = require("express");
const Product = require("../models/Product");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ===============================
// ADD PRODUCT
// ===============================

router.post("/", authMiddleware, async (req, res) => {
    try {
        const {
            title,
            description,
            price,
            category,
            condition
        } = req.body;

        // Check required fields
        if (
            !title ||
            !description ||
            price === undefined ||
            !category ||
            !condition
        ) {
            return res.status(400).json({
                message: "Please fill all fields"
            });
        }

        // Create product
        const product = await Product.create({
            title,
            description,
            price,
            category,
            condition,
            seller: req.user.id
        });

        res.status(201).json({
            message: "Product added successfully",
            product
        });

    } catch (error) {
        console.error("Add Product Error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

// ===============================
// GET ALL PRODUCTS
// ===============================

router.get("/", async (req, res) => {
    try {
        const products = await Product.find()
            .populate("seller", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            products
        });

    } catch (error) {
        console.error("Get Products Error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

module.exports = router;