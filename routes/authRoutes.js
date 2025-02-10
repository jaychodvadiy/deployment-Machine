const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User"); // Assuming your User model is correctly imported
const router = express.Router();
const { body, validationResult } = require("express-validator");

// POST /register - User registration
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  console.log("Received Data:", req.body);

  // Check for missing fields
  if (!name || !email || !password) {
    console.log("running!");

    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Use a different email ID",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();
    return res
      .status(200)
      .json({ success: true, message: "User successfully created" });
  } catch (error) {
    console.error("❌ Error during registration:", error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
});

// POST route for login
router.post("/login", async (req, res) => {
  console.log("Login Request Received:", req.body); // Debugging

  const { email, password } = req.body;

  // Validate input fields
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Login successful", user });
  } catch (error) {
    console.error("❌ Login Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
