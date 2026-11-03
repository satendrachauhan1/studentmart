const mongoose = require("mongoose");

const productOfferSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    offerPrice: { type: Number, required: true, min: 0 },
    message: { type: String, trim: true, maxlength: 500, default: "" },
    pickupProposal: { type: String, trim: true, maxlength: 160, default: "" },
    status: { type: String, enum: ["pending", "accepted", "declined", "countered"], default: "pending" },
    counterPrice: { type: Number, min: 0, default: null }
}, { timestamps: true });

module.exports = mongoose.model("ProductOffer", productOfferSchema);
