const express = require("express");
const mongoose = require("mongoose");
const SavedProduct = require("../models/SavedProduct");
const Product = require("../models/Product");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
router.use(authMiddleware);

router.get("/", async (req, res) => {
    try {
        const saved = await SavedProduct.find({ user: req.user.id }).populate({
            path: "product", populate: { path: "seller", select: "name email" }
        }).sort({ createdAt: -1 });
        res.json({ products: saved.map((item) => item.product).filter(Boolean) });
    } catch (error) {
        console.error("Load saved products error:", error);
        res.status(500).json({ message: "Unable to load saved products" });
    }
});

router.post("/:productId", async (req, res) => {
    try {
        const { productId } = req.params;
        if (!mongoose.isValidObjectId(productId)) return res.status(400).json({ message: "Invalid product id" });
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });
        await SavedProduct.updateOne({ user: req.user.id, product: productId }, { $setOnInsert: { user: req.user.id, product: productId } }, { upsert: true });
        res.status(201).json({ message: "Product saved", saved: true });
    } catch (error) {
        console.error("Save product error:", error);
        res.status(500).json({ message: "Unable to save product" });
    }
});

router.delete("/:productId", async (req, res) => {
    try {
        await SavedProduct.deleteOne({ user: req.user.id, product: req.params.productId });
        res.json({ message: "Product removed from saved items", saved: false });
    } catch (error) {
        console.error("Unsave product error:", error);
        res.status(500).json({ message: "Unable to remove saved product" });
    }
});

module.exports = router;
