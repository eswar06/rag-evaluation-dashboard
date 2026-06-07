const { mockCohereRerank } = require("./rerank.service");
const { MIN_SIMILARITY_THRESHOLD } = require("../config/ai.config");

const retrieveChunks = async (localVectorIndex, rawQuery, queryEmbedding, topK, coarseTopK) => {
    if (!localVectorIndex) {
        throw new Error("Vector index is not initialized");
    }

    const coarseCandidates = localVectorIndex.search(
        queryEmbedding,
        Math.max(coarseTopK, topK)
    );

    const rerankedCandidates = await mockCohereRerank(rawQuery, coarseCandidates);

    const relevantMatches = rerankedCandidates
        // .filter((candidate) => candidate.rerankScore >= MIN_SIMILARITY_THRESHOLD)
        .slice(0, topK)
        .map((candidate) => ({
            id: candidate.id,
            text: candidate.text,
            metadata: candidate.metadata,
            score: candidate.rerankScore,
            vectorScore: candidate.vectorScore
        }));

    return relevantMatches;
};

module.exports = {
    retrieveChunks
};
