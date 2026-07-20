import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const groqClient = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env.GROQ_API_KEY,
    timeout: 30000,
});

async function test() {
    try {
        console.log("Sending request to Groq vision model...");
        const response = await groqClient.chat.completions.create({
            model: "llama-3.2-11b-vision-preview",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "What is in this image?" },
                        {
                            type: "image_url",
                            image_url: {
                                url: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCABQAFADASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AJbAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//2Q==",
                            },
                        },
                    ],
                },
            ],
            temperature: 0.1,
        });
        console.log("Success:", response.choices[0].message.content);
    } catch (e) {
        console.error("Error:", e);
    }
}
test();
