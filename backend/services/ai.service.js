import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

let genAI = null;
if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
}

export const generateCaption = async (description) => {
    if (!genAI) return description; // fallback
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `Write a catchy, short Instagram caption for the following description. Include a few relevant emojis and hashtags. Just return the caption text.\n\nDescription: ${description}`;
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error("AI Caption Error:", error);
        return description; // fallback
    }
};

export const moderateContent = async (text) => {
    if (!genAI || !text) return true; // fallback to true if no key
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `Analyze the following text and determine if it contains highly inappropriate, hateful, or explicit NSFW content. Respond with only "APPROVE" or "REJECT".\n\nText: ${text}`;
        const result = await model.generateContent(prompt);
        const verdict = result.response.text().trim();
        return verdict === "APPROVE";
    } catch (error) {
        console.error("AI Moderation Error:", error);
        return true; // fail open
    }
};

export const generateEmbedding = async (text) => {
    if (!genAI || !text) return [];
    try {
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await model.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.error("AI Embedding Error:", error);
        return [];
    }
};
