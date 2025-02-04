const mongoose = require("mongoose");

const listSchema = new mongoose.Schema({
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: "Agent", required: true },
  items: { type: Array, required: true },
});

module.exports = mongoose.model("List", listSchema);
