const { createEmbedding } = require("../services/embedding.service");
const { retrieveChunks } = require("../services/retrieval.service");
const embeddedChunkStore = require("../storage/embeddedChunkStore");
const { MIN_SIMILARITY_THRESHOLD } = require("../config/ai.config");

const parseTopK = (value) => {
    const parsedTopK = Number.parseInt(value, 10);
    if (!Number.isFinite(parsedTopK)) return 3;
    return Math.min(Math.max(parsedTopK, 1), 10);
};

const parseCoarseTopK = (value) => {
    const parsedTopK = Number.parseInt(value, 10);
    if (!Number.isFinite(parsedTopK)) return 15; // DEFAULT_COARSE_TOP_K
    return Math.min(Math.max(parsedTopK, 1), 50);
};

const queryPdf = async (req, res) => {
    try {
        console.log(req.body?.query, "req query")
        const query = req.body?.query;
        const topK = parseTopK(req.body?.topK);
        const coarseTopK = parseCoarseTopK(req.body?.coarseTopK);

        if (!query || typeof query !== "string") {
            return res.status(400).json({ error: "Query is required" });
        }

        const chunksStore = embeddedChunkStore.getChunks();
        const localVectorIndex = embeddedChunkStore.getVectorIndex();

        if (chunksStore.length === 0 || !localVectorIndex) {
            return res.status(400).json({ error: "Upload and process a PDF before querying" });
        }

        const queryEmbedding = await createEmbedding(query);
        const relevantMatches = await retrieveChunks(
            localVectorIndex,
            query,
            queryEmbedding,
            topK,
            coarseTopK
        );

        if (relevantMatches.length === 0) {
            return res.json({
                success: true,
                query,
                topK,
                coarseTopK: Math.max(coarseTopK, topK),
                threshold: MIN_SIMILARITY_THRESHOLD,
                chunks: [],
                matches: [],
                message: "No highly relevant context found in the uploaded documents to accurately answer this question."
            });
        }

        res.json({
            success: true,
            query,
            topK,
            coarseTopK: Math.max(coarseTopK, topK),
            threshold: MIN_SIMILARITY_THRESHOLD,
            chunks: relevantMatches,
            matches: relevantMatches
        });
    } catch (error) {
        console.error("Query Error:", error);
        res.status(500).json({ error: error.message || "Failed to search chunks" });
    }
};

module.exports = {
    queryPdf
};
