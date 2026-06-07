const express = require("express");
const cors = require("cors");
const pdfRoutes = require("./routes/pdf.routes");
const queryRoutes = require("./routes/query.routes");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

app.use((res, req, next) => {
    console.log("request received");
    next();
});

// Bind routes
app.use("/", pdfRoutes);
app.use("/", queryRoutes);

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`PDF extract service running on port ${PORT}`);
});
