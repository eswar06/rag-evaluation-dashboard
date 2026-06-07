const express = require("express");
const router = express.Router();
const { upload } = require("../middleware/upload.middleware");
const { uploadPdf } = require("../controllers/pdf.controller");

router.post("/upload-pdf", upload.single("pdf"), uploadPdf);

module.exports = router;
