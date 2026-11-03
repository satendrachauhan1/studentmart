const mongoose = require("mongoose");

const savedProductSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }
}, { timestamps: true });

savedProductSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model("SavedProduct", savedProductSchema);
