const express = require("express");
const { addAgent, getAgents } = require("../controllers/agentController");

const router = express.Router();

router.post("/add", addAgent);
router.get("/", getAgents);

module.exports = router;
