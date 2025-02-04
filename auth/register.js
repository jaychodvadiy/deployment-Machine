const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const User = require("../models/User");
const mongoose = require("mongoose");

const app = express();
const router = express.Router();

// Middleware to parse JSON bodies
app.use(express.json());

// Set up CORS for frontend access
app.use(
  cors({
    origin: "http://localhost:3000", // Your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

mongoose
  .connect("mongodb://localhost:27017/yourDatabaseName", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 60000,
    serverSelectionTimeoutMS: 60000,
  })
  .then(() => {
    console.log("✅ MongoDB connected");
    return mongoose
      .model("User", new mongoose.Schema({ email: String }))
      .findOne({ email: "test@example.com" });
  })
  .then((user) => {
    console.log("User found:", user);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection or query error:", err);
  });

// Middleware to Check Database Connection Before Handling Requests
app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res
      .status(503)
      .json({ success: false, message: "Database not connected" });
  }
  next();
});

// User Registration Route
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

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
    console.error("❌ Error during user registration:", error.message); // Improved logging
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message, // Sending specific error details
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
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

module.exports = router;
