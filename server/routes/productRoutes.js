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
            name,
            description,
            price,
            category,
            condition,
            image,
            stock,
            author,
            genreBadge,
            semesterTag,
            originalPrice,
            rentPrice,
            pickup,
            allowSwap
        } = req.body;
        const productName = typeof title === "string" ? title : name;

        // Check required fields
        if (
            typeof productName !== "string" || !productName.trim() ||
            typeof description !== "string" || !description.trim() ||
            !Number.isFinite(Number(price)) || Number(price) < 0 ||
            typeof category !== "string" || !category.trim() ||
            (condition && !["New", "Like New", "Good", "Used", "Read Once"].includes(condition)) ||
            (originalPrice !== undefined && originalPrice !== "" && (!Number.isFinite(Number(originalPrice)) || Number(originalPrice) < 0)) ||
            (rentPrice !== undefined && rentPrice !== "" && (!Number.isFinite(Number(rentPrice)) || Number(rentPrice) < 0)) ||
            (stock !== undefined && (!Number.isInteger(Number(stock)) || Number(stock) < 0))
        ) {
            return res.status(400).json({
                message: "Please fill all fields"
            });
        }

        // Create product
        const product = await Product.create({
            title: productName.trim(),
            description: String(description).trim(),
            price: Number(price),
            category: String(category).trim(),
            condition: condition || "Good",
            image: typeof image === "string" ? image.trim() : "",
            stock: stock === undefined ? 0 : Number(stock),
            author: typeof author === "string" ? author.trim() : "",
            genreBadge: typeof genreBadge === "string" ? genreBadge.trim() : "",
            semesterTag: typeof semesterTag === "string" ? semesterTag.trim() : "",
            originalPrice: originalPrice === undefined || originalPrice === "" ? 0 : Number(originalPrice),
            rentPrice: rentPrice === undefined || rentPrice === "" ? 0 : Number(rentPrice),
            pickup: typeof pickup === "string" ? pickup.trim() : "",
            allowSwap: Boolean(allowSwap),
            seller: req.user.id
        });

        res.status(201).json({
            message: "Product added successfully",
            product
        });

    } catch (error) {
        console.error("Add Product Error:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({ message: error.message });
        }

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
        const { search = "", category = "", sort = "" } = req.query;
        const filter = {};
        if (search.trim()) {
            const term = { $regex: search.trim(), $options: "i" };
            filter.$or = [{ title: term }, { author: term }, { category: term }, { genreBadge: term }];
        }
        if (category.trim() && category !== "All") filter.category = category.trim();
        if (req.query.acquisition === "rent-swap") filter.allowSwap = true;
        const sortOrder = sort === "lowToHigh" || sort === "low-high" ? 1
            : sort === "highToLow" || sort === "high-low" ? -1 : null;
        const query = Product.find(filter)
            .populate("seller", "name email")
            .sort(sortOrder ? { price: sortOrder } : { createdAt: -1 });
        const products = await query;
        if (req.query.sort === "popular") products.sort((a, b) => (b.views || 0) - (a.views || 0));

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

router.get("/:id", async (req, res) => {
    try {
        if (!require("mongoose").isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid product id" });
        }
        const product = await Product.findById(req.params.id).populate("seller", "name email");
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
    } catch (error) {
        console.error("Get Product Error:", error);
        res.status(500).json({ message: "Unable to load product" });
    }
});

router.post("/:id/view", async (req, res) => {
    try {
        if (!require("mongoose").isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid product id" });
        const product = await Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true }).select("views");
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json({ views: product.views });
    } catch (error) {
        console.error("Record product view error:", error);
        res.status(500).json({ message: "Unable to record product view" });
    }
});

router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        if (!require("mongoose").isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid product id" });
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        if (String(product.seller) !== String(req.user.id)) return res.status(403).json({ message: "Only the seller can remove this listing" });
        await product.deleteOne();
        res.json({ message: "Listing removed" });
    } catch (error) {
        console.error("Delete Product Error:", error);
        res.status(500).json({ message: "Unable to remove listing" });
    }
});

module.exports = router;
