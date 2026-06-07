const normalizeVector = (vector) => {
    const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));

    if (magnitude === 0) {
        return vector.map(() => 0);
    }

    return vector.map((value) => value / magnitude);
};

module.exports = {
    normalizeVector
};
