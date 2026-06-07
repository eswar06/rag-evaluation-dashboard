const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || "text-embedding-004";
const MIN_SIMILARITY_THRESHOLD = Number.parseFloat(process.env.MIN_SIMILARITY_THRESHOLD || "0.70");

if (!process.env.GEMINI_API_KEY) {
    console.warn("WARNING: GEMINI_API_KEY is not defined in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

module.exports = {
    ai,
    EMBEDDING_MODEL,
    MIN_SIMILARITY_THRESHOLD
};
