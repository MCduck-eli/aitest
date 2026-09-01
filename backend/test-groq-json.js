const Groq = require("groq-sdk");
require("dotenv").config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
    try {
        const response = await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages: [
                { role: "system", content: "JSON formatida javob ber: {\"status\": \"ok\"}" },
                { role: "user", content: "test" }
            ],
            // response_format: { type: "json_object" },
            temperature: 0.1
        });
        console.log("RESPONSE:", response.choices[0].message.content);
    } catch (e) {
        console.error("ERROR:", e.message);
    }
}
main();
