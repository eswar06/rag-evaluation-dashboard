const express = require("express");
const router = express.Router();
const { queryPdf } = require("../controllers/query.controller");

router.post("/query", queryPdf);

module.exports = router;
