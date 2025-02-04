const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit on failure
  }
};

module.exports = dbConnect;
