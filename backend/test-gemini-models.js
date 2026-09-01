const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function listModels() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // The SDK might not have a direct listModels, let's just fetch it via REST
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await res.json();
        if (data.models) {
            console.log("AVAILABLE MODELS:");
            data.models.filter(m => m.supportedGenerationMethods.includes('generateContent')).forEach(m => console.log(m.name));
        } else {
            console.log("ERROR OR NO MODELS:", data);
        }
    } catch (e) {
        console.error("Script error:", e);
    }
}
listModels();
