const Agent = require("../models/Agent");
const xlsx = require("xlsx");

exports.uploadList = async (req, res) => {
  const file = req.file;

  if (!file) return res.status(400).json({ message: "No file uploaded" });

  const workbook = xlsx.readFile(file.path);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet);

  const agents = await Agent.find();
  const distributed = data.reduce((acc, item, index) => {
    const agentIndex = index % agents.length;
    if (!acc[agents[agentIndex]._id]) acc[agents[agentIndex]._id] = [];
    acc[agents[agentIndex]._id].push(item);
    return acc;
  }, {});

  await Promise.all(
    Object.entries(distributed).map(async ([agentId, items]) => {
      await Agent.findByIdAndUpdate(agentId, { $push: { lists: items } });
    })
  );

  res.json({ message: "Tasks distributed successfully!" });
};
