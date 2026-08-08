require('dotenv').config();
const OpenAI = require('openai');
const groqClient = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env.GROQ_API_KEY,
    timeout: 30000,
});

async function run() {
    try {
        const response = await groqClient.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: "Respond with JSON."
                },
                {
                    role: "user",
                    content: "Test"
                }
            ],
            response_format: { type: "json_object" },
        });
        console.log("Success:", response.choices[0].message.content);
    } catch (e) {
        console.error("Error:", e);
    }
}
run();
