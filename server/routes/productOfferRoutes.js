const express = require("express");
const mongoose = require("mongoose");
const ProductOffer = require("../models/ProductOffer");
const Product = require("../models/Product");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
router.use(authMiddleware);

router.get("/incoming", async (req, res) => {
    try {
        const offers = await ProductOffer.find({ seller: req.user.id })
            .populate("product", "title price category image")
            .populate("buyer", "name email")
            .sort({ createdAt: -1 });
        res.json({ offers });
    } catch (error) {
        console.error("Load buyer offers error:", error);
        res.status(500).json({ message: "Unable to load offers" });
    }
});

router.post("/", async (req, res) => {
    try {
        const { productId, offerPrice, message, pickupProposal } = req.body;
        if (!mongoose.isValidObjectId(productId)) return res.status(400).json({ message: "Invalid product id" });
        if (!Number.isFinite(Number(offerPrice)) || Number(offerPrice) < 0) return res.status(400).json({ message: "Enter a valid offer price" });
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });
        if (String(product.seller) === String(req.user.id)) return res.status(403).json({ message: "You cannot make an offer on your own listing" });
        const existing = await ProductOffer.findOne({ product: productId, buyer: req.user.id, status: "pending" });
        if (existing) return res.status(409).json({ message: "You already have a pending offer on this listing" });
        const offer = await ProductOffer.create({
            product: productId, seller: product.seller, buyer: req.user.id,
            offerPrice: Number(offerPrice),
            message: typeof message === "string" ? message.trim() : "",
            pickupProposal: typeof pickupProposal === "string" ? pickupProposal.trim() : ""
        });
        await offer.populate("product", "title price category image");
        await offer.populate("buyer", "name email");
        res.status(201).json({ offer });
    } catch (error) {
        console.error("Create buyer offer error:", error);
        res.status(500).json({ message: "Unable to send offer" });
    }
});

router.patch("/:id/respond", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid offer id" });
        const { status, counterPrice } = req.body;
        if (!["accepted", "declined", "countered"].includes(status)) return res.status(400).json({ message: "Choose accept, decline, or counter" });
        if (status === "countered" && (!Number.isFinite(Number(counterPrice)) || Number(counterPrice) < 0)) return res.status(400).json({ message: "Enter a valid counter-offer" });
        const offer = await ProductOffer.findOne({ _id: req.params.id, seller: req.user.id });
        if (!offer) return res.status(404).json({ message: "Offer not found" });
        if (offer.status !== "pending") return res.status(409).json({ message: "This offer has already been handled" });
        offer.status = status;
        if (status === "countered") offer.counterPrice = Number(counterPrice);
        await offer.save();
        await offer.populate("product", "title price category image");
        await offer.populate("buyer", "name email");
        res.json({ offer });
    } catch (error) {
        console.error("Respond to buyer offer error:", error);
        res.status(500).json({ message: "Unable to respond to offer" });
    }
});

module.exports = router;
