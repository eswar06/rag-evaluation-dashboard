class EmbeddedChunkStore {
    constructor() {
        this.embeddedChunkStore = [];
        this.localVectorIndex = null;
    }

    setChunks(chunks) {
        this.embeddedChunkStore = chunks;
    }

    getChunks() {
        return this.embeddedChunkStore;
    }

    setVectorIndex(index) {
        this.localVectorIndex = index;
    }

    getVectorIndex() {
        return this.localVectorIndex;
    }

    clear() {
        this.embeddedChunkStore = [];
        this.localVectorIndex = null;
    }
}

// Export singleton instance
module.exports = new EmbeddedChunkStore();
