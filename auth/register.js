const express = require("express");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("../models/User");
const router = express.Router();
const app = express(); // Initialize the app

app.use(express.json()); // Middleware to parse JSON request body
app.use(cors()); // Enable CORS

// MongoDB Connection with Retry Mechanism
const connectWithRetry = () => {
  console.log("Attempting to connect to MongoDB..."); // Debugging log

  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
      socketTimeoutMS: 45000,
    })
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));  
};

connectWithRetry();

// User Registration Route
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  // Input Validation
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields (name, email, password)",
    });
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Use a different email ID",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    // Save the new user
    await newUser.save();

    // Send success response
    return res.status(201).json({
      success: true,
      message: "User successfully created",
    });
  } catch (error) {
    console.error("❌ Error during user registration:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// API Routes
app.use("/api/auth", router);

// Global Error Handler (Catches Unhandled Errors)
app.use((err, req, res, next) => {
  console.error("❗ Global Error Handler:", err.stack);
  res.status(500).json({ success: false, message: "Something went wrong" });
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

module.exports = router;
