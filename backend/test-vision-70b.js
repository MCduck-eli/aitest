require('dotenv').config();
const OpenAI = require('openai');
const groqClient = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env.GROQ_API_KEY,
});

async function run() {
    try {
        const response = await groqClient.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "What's in this image?" },
                        { type: "image_url", image_url: { url: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACP/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8An8H/2Q==" } }
                    ]
                }
            ]
        });
        console.log("Success:", response.choices[0].message.content);
    } catch (e) {
        console.error("Error:", e.message);
    }
}
run();
