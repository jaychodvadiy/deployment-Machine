const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const router = express.Router();

// User Registration Route
router.post("/register", async (req, res) => {
  const { username, name, email, password, phone } = req.body;

  // Check if all fields are provided
  if (!username || !name || !email || !password || !phone) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    user = new User({ username, name, email, password: hashPassword, phone });
    await user.save();

    return res
      .status(201)
      .json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error("Error during registration:", error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
});

exports.login = async (req, res) => {
  try {
    console.log("Received login request:", req.body); // Log incoming data

    const { email, password } = req.body;
    if (!email || !password) {
      console.log("Missing email or password");
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found");
      return res
        .status(401)
        .json({ message: "User not found. Please register first." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Invalid password");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    console.log("Login successful, token generated");

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
