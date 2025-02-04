const Agent = require("../models/Agent");

exports.addAgent = async (req, res) => {
  const { name, email, mobile, password } = req.body;

  try {
    const newAgent = new Agent({ name, email, mobile, password });
    await newAgent.save();
    res.json({ message: "Agent added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAgents = async (req, res) => {
  try {
    const agents = await Agent.find();
    res.json(agents);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
