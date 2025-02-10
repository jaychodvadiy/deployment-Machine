const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1); // Exit on failure
  }
};

// Event Listeners for Debugging
// mongoose.connection.on("connected", () => {
//   console.log("✅ Mongoose connected to DB");
// });

// mongoose.connection.on("error", (err) => {
//   console.error("❌ Mongoose connection error:", err);
// });

// mongoose.connection.on("disconnected", () => {
//   console.log("⚠️ Mongoose disconnected");
// });

module.exports = dbConnect;
