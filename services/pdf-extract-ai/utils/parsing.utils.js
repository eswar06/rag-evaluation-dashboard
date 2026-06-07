const parseChunkNumber = (value, fallback) => {
    const parsedValue = Number.parseInt(value, 10);
    return Number.isFinite(parsedValue) ? parsedValue : fallback;
};

module.exports = {
    parseChunkNumber
};
