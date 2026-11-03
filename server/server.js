const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const savedProductRoutes = require("./routes/savedProductRoutes");
const bookRequestRoutes = require("./routes/bookRequestRoutes");
const productOfferRoutes = require("./routes/productOfferRoutes");
const app = express();

// Connect MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/saved-products", savedProductRoutes);
app.use("/api/book-requests", bookRequestRoutes);
app.use("/api/product-offers", productOfferRoutes);

// Test route
app.get("/", (req, res) => {
    res.send("StudentMart API is running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`StudentMart server running on port ${PORT}`);
});
