const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
model.generateContent("Hello").then(res => console.log("Success:", res.response.text())).catch(err => console.error("Error:", err.message));
