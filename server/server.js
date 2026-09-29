const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const app = express();

// Connect MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
    res.send("StudentMart API is running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`StudentMart server running on port ${PORT}`);
});