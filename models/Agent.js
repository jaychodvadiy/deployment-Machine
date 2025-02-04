const mongoose = require("mongoose");

const agentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  password: { type: String, required: true },
  lists: { type: Array, default: [] },
});

module.exports = mongoose.model("Agent", agentSchema);
