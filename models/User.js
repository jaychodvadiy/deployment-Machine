const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true, // Ensures the email field is indexed for faster queries
  },

  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
