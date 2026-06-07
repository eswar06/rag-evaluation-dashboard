const pdfParse = require("pdf-parse-new");

const parsePdf = async (dataBuffer) => {
    return pdfParse(dataBuffer);
};

module.exports = {
    parsePdf
};
