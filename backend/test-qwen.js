const Groq = require("groq-sdk");
require("dotenv").config();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
async function main() {
    try {
        const response = await groq.chat.completions.create({
            model: "qwen/qwen3.8-27b",
            messages: [
                { role: "system", content: "Siz IT o'qituvchisiz. O'zbek tilida JSON formatida 1 ta test savoli tuzib bering: { \"questions\": [ { \"question_text\": \"...\" } ] }" },
                { role: "user", content: "HTML haqida test tuz." }
            ],
            temperature: 0.1
        });
        console.log("RESPONSE:", response.choices[0].message.content);
    } catch (e) {
        console.error("ERROR:", e.message);
    }
}
main();
