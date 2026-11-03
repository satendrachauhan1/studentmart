const express = require("express");
const mongoose = require("mongoose");
const BookRequest = require("../models/BookRequest");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
    try {
        const requests = await BookRequest.find().populate("user", "name email").populate("offers.user", "name email").sort({ fulfilled: 1, createdAt: -1 });
        res.json({ requests });
    } catch (error) {
        console.error("Load book requests error:", error);
        res.status(500).json({ message: "Unable to load book requests" });
    }
});

router.post("/", authMiddleware, async (req, res) => {
    try {
        const { lookingFor, budget, urgency } = req.body;
        if (typeof lookingFor !== "string" || !lookingFor.trim()) return res.status(400).json({ message: "Tell us which book or item you need" });
        const request = await BookRequest.create({
            user: req.user.id, lookingFor: lookingFor.trim(),
            budget: typeof budget === "string" ? budget.trim() : "",
            urgency: typeof urgency === "string" ? urgency.trim() : "This Week"
        });
        await request.populate("user", "name");
        res.status(201).json({ request });
    } catch (error) {
        console.error("Create book request error:", error);
        res.status(500).json({ message: "Unable to post book request" });
    }
});

router.patch("/:id/fulfill", authMiddleware, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid request id" });
        const request = await BookRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ message: "Request not found" });
        if (String(request.user) !== String(req.user.id)) return res.status(403).json({ message: "Only the request owner can mark this fulfilled" });
        request.fulfilled = true;
        await request.save();
        await request.populate("user", "name");
        res.json({ request });
    } catch (error) {
        console.error("Fulfill book request error:", error);
        res.status(500).json({ message: "Unable to update book request" });
    }
});

router.post("/:id/offers", authMiddleware, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid request id" });
        const request = await BookRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ message: "Request not found" });
        if (request.fulfilled) return res.status(409).json({ message: "This request has already been fulfilled" });
        if (String(request.user) === String(req.user.id)) return res.status(403).json({ message: "You cannot offer help on your own request" });
        if (request.offers.some((offer) => String(offer.user) === String(req.user.id))) return res.status(409).json({ message: "You have already offered help" });
        request.offers.push({ user: req.user.id, message: typeof req.body.message === "string" ? req.body.message.trim().slice(0, 300) : "I can help with this request" });
        await request.save();
        await request.populate("user offers.user", "name email");
        res.status(201).json({ request });
    } catch (error) {
        console.error("Offer help on book request error:", error);
        res.status(500).json({ message: "Unable to send offer" });
    }
});

router.patch("/:id/offers/:offerId", authMiddleware, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid request id" });
        const decision = req.body.status;
        if (!["accepted", "declined"].includes(decision)) return res.status(400).json({ message: "Choose accept or decline" });
        const request = await BookRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ message: "Request not found" });
        if (String(request.user) !== String(req.user.id)) return res.status(403).json({ message: "Only the request owner can respond to offers" });
        const offer = request.offers.id(req.params.offerId);
        if (!offer) return res.status(404).json({ message: "Offer not found" });
        offer.status = decision;
        if (decision === "accepted") request.fulfilled = true;
        await request.save();
        await request.populate("user offers.user", "name email");
        res.json({ request });
    } catch (error) {
        console.error("Respond to book request offer error:", error);
        res.status(500).json({ message: "Unable to update offer" });
    }
});

module.exports = router;
