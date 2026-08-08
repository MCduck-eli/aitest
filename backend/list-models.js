require('dotenv').config();
const OpenAI = require('openai');
const groqClient = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env.GROQ_API_KEY,
});

async function run() {
    try {
        const models = await groqClient.models.list();
        models.data.forEach(m => console.log(m.id));
    } catch (e) {
        console.error("Error:", e.message);
    }
}
run();
