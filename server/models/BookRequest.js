const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, trim: true, maxlength: 300, default: "I can help with this request" },
    status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" }
}, { timestamps: true });

const bookRequestSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lookingFor: { type: String, required: true, trim: true, maxlength: 160 },
    budget: { type: String, trim: true, maxlength: 80, default: "Open to buy or swap" },
    urgency: { type: String, trim: true, maxlength: 60, default: "This Week" },
    fulfilled: { type: Boolean, default: false },
    offers: { type: [offerSchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.model("BookRequest", bookRequestSchema);
