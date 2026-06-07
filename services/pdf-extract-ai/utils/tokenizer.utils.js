const tokenizeForRerank = (value) => {
    const stopWords = new Set([
        "what",
        "when",
        "where",
        "which",
        "who",
        "whom",
        "why",
        "how",
        "did",
        "does",
        "the",
        "and",
        "for",
        "with",
        "from"
    ]);

    const normalizeToken = (token) => {
        if (token.endsWith("ing") && token.length > 5) {
            return token.slice(0, -3);
        }

        if (token.endsWith("ed") && token.length > 4) {
            const withoutSuffix = token.slice(0, -2);
            return withoutSuffix.endsWith("v") ? `${withoutSuffix}e` : withoutSuffix;
        }

        if (token.endsWith("es") && token.length > 4) {
            return token.slice(0, -2);
        }

        if (token.endsWith("s") && token.length > 3) {
            return token.slice(0, -1);
        }

        return token.trim();
    };

    return new Set(
        value
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, " ")
            .split(/\s+/)
            .map(normalizeToken)
            .filter((token) => token.length > 2 && !stopWords.has(token))
    );
};

module.exports = {
    tokenizeForRerank
};
