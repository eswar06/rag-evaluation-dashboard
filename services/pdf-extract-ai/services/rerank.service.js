const { tokenizeForRerank } = require("../utils/tokenizer.utils");
const { createMetadataPrefix } = require("./metadata.service");

const calculateLexicalRelevance = (query, candidateText) => {
    const queryTokens = tokenizeForRerank(query);
    const candidateTokens = tokenizeForRerank(candidateText);

    if (!queryTokens.size || !candidateTokens.size) {
        return 0;
    }

    let matchingTokenCount = 0;
    queryTokens.forEach((token) => {
        if (candidateTokens.has(token)) {
            matchingTokenCount += 1;
        }
    });

    return matchingTokenCount / queryTokens.size;
};

const mockCohereRerank = async (query, candidates) => {
    await Promise.resolve();

    return candidates
        .map((candidate) => {
            const rerankInput = `${createMetadataPrefix(candidate.metadata)}\n\n${candidate.text}`;
            const lexicalScore = calculateLexicalRelevance(query, rerankInput);
            const relevanceScore = Math.min(
                1,
                Number(((candidate.vectorScore * 0.55) + (lexicalScore * 0.45)).toFixed(6))
            );

            return {
                ...candidate,
                score: relevanceScore,
                rerankScore: relevanceScore
            };
        })
        .sort((firstCandidate, secondCandidate) => secondCandidate.rerankScore - firstCandidate.rerankScore);
};

module.exports = {
    calculateLexicalRelevance,
    mockCohereRerank
};
