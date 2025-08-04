const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Image = require("../schema/advertiseSchema"); 

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage });

router.post("/Homeimages", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const imageDoc = new Image({ icons: req.file.filename });
    await imageDoc.save();

    res.status(200).json({ message: "Image uploaded and saved", data: imageDoc });
  } catch (err) {
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
});

router.get("/Homeimages", async (req, res) => {
  try {
    const images = await Image.find().sort({ uploadedAt: -1 });
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: "Error fetching images", details: err.message });
  }
});

module.exports = router;
