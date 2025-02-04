const express = require("express");
const { uploadList } = require("../controllers/listController");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.post("/upload", upload.single("file"), uploadList);

module.exports = router;
