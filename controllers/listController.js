const Agent = require("../models/Agent");
const xlsx = require("xlsx");
const multer = require("multer");
const path = require("path");

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Save files in 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Unique filename
  },
});

const upload = multer({ storage: storage });

exports.uploadList = async (req, res) => {
  try {
    console.log("Received request for file upload");
    console.log("File received:", req.file);

    // 1️⃣ Check if the file exists
    if (!req.file) {
      console.error("No file uploaded");
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("Uploaded file:", req.file.path);

    // 2️⃣ Read the Excel file
    let workbook;
    try {
      workbook = xlsx.readFile(req.file.path);
    } catch (err) {
      console.error("Error reading file:", err.message);
      return res.status(400).json({ message: "Invalid file format" });
    }

    // 3️⃣ Convert sheet data to JSON
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    console.log("Extracted data:", data);

    if (!data || data.length === 0) {
      return res
        .status(400)
        .json({ message: "Uploaded file is empty or has invalid data" });
    }

    // 4️⃣ Fetch agents from the database
    const agents = await Agent.find();

    console.log("Agents found:", agents.length);

    if (agents.length === 0) {
      return res
        .status(400)
        .json({ message: "No agents available to assign tasks." });
    }

    // 5️⃣ Distribute tasks
    const distributed = data.reduce((acc, item, index) => {
      const agentIndex = index % agents.length;
      const agent = agents[agentIndex];

      if (agent) {
        if (!acc[agent._id]) acc[agent._id] = [];
        acc[agent._id].push(item);
      }

      return acc;
    }, {});

    // 6️⃣ Update agents in the database
    await Promise.all(
      Object.entries(distributed).map(async ([agentId, items]) => {
        await Agent.findByIdAndUpdate(agentId, { $push: { lists: items } });
      })
    );

    res.json({ message: "Tasks distributed successfully!" });
  } catch (error) {
    console.error("Error in uploadList:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
