const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Ensure upload directory exists relative to root
const uploadDir = path.join(__dirname, "../uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({ dest: uploadDir + "/" });

module.exports = {
    upload
};
