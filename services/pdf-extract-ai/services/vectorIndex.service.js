const { normalizeVector } = require("../utils/vector.utils");
const DEFAULT_COARSE_TOP_K = 15;

class LocalVectorIndex {
    constructor() {
        this.items = [];
        this.dimension = 0;
        this.matrix = new Float32Array(0);
    }

    build(items) {
        if (!items.length) {
            this.items = [];
            this.dimension = 0;
            this.matrix = new Float32Array(0);
            return;
        }

        this.items = items;
        this.dimension = items[0].embedding.length;
        this.matrix = new Float32Array(items.length * this.dimension);

        items.forEach((item, itemIndex) => {
            const normalizedEmbedding = normalizeVector(item.embedding);
            const offset = itemIndex * this.dimension;

            for (let dimensionIndex = 0; dimensionIndex < this.dimension; dimensionIndex += 1) {
                this.matrix[offset + dimensionIndex] = normalizedEmbedding[dimensionIndex] || 0;
            }
        });
    }

    search(queryEmbedding, topK = DEFAULT_COARSE_TOP_K) {
        if (!this.items.length || !this.dimension || queryEmbedding.length !== this.dimension) {
            return [];
        }

        const normalizedQuery = normalizeVector(queryEmbedding);
        const scoredItems = [];

        for (let itemIndex = 0; itemIndex < this.items.length; itemIndex += 1) {
            const offset = itemIndex * this.dimension;
            let score = 0;

            for (let dimensionIndex = 0; dimensionIndex < this.dimension; dimensionIndex += 1) {
                score += normalizedQuery[dimensionIndex] * this.matrix[offset + dimensionIndex];
            }

            scoredItems.push({
                ...this.items[itemIndex],
                vectorScore: score
            });
        }

        return scoredItems
            .sort((firstItem, secondItem) => secondItem.vectorScore - firstItem.vectorScore)
            .slice(0, topK);
    }
}

module.exports = {
    LocalVectorIndex
};
