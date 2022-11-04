const express = require("express");
const router = express.Router();
const {
  uploadImage,
  uploadItemImage,
} = require("../controllers/uploadImageController");

router.post("/upload", uploadImage);
router.post("/upload-item", uploadItemImage);

module.exports = router;
