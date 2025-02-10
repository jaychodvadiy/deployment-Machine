const express = require("express");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("../models/User");
const router = express.Router();
const app = express();

app.use(express.json());
app.use(cors());

const connectWithRetry = () => {
  console.log("Attempting to connect to MongoDB...");

  mongoose
    .connect("mongodb://127.0.0.1:27017/yourDatabaseName", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    })
    .then(() => console.log("✅ MongoDB connected successfully"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

  module.exports = mongoose;
};

connectWithRetry();

// User Registration Route
export const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email: email });

    if (user) {
      return res
        .status(400)
        .json({
          success: false,
          message: "User already exists. Use diffrent mail Id",
        });
    }

    const salt = await bcrypt.genSalt(10);
    const hashpassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashpassword,
    });

    await user.save();
    return res
      .status(200)
      .json({ success: true, message: "User successfully created" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};
// export const registerUser = async (req, res, next) => {
//   const { name, email, password, phone } = req.body;

//   try {
//       let user = await User.findOne({ email: email });

//       if (user) {
//           return res.status(400).json({ success: false, message: "User already exists. Use diffrent mail Id" })
//       }

//       const salt = await bcrypt.genSalt(10);
//       const hashpassword = await bcrypt.hash(password, salt);

//       user = new User({
//           name, email, password: hashpassword, phone
//       })

//       await user.save()
//       return res.status(200).json({ success: true, message: "User successfully created" })
//   } catch (error) {
//       console.log(error)
//       return res.status(500).json({ success: false, message: "Something went wrong" })
//   }
// }

app.use("/api/auth", router);

app.use((err, req, res, next) => {
  console.error("❗ Global Error Handler:", err.stack);
  res.status(500).json({ success: false, message: "Something went wrong" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

module.exports = router;
