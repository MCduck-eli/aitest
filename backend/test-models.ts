import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

async function listAllAvailableModels() {
    try {
        console.log(
            "🔍 Groq platformasidagi barcha faol modellar ro'yxati olinmoqda...",
        );
        const modelsList = await groq.models.list();

        console.log("\n📋 MAVJUD MODELLAR RO'YXATI:");
        console.table(
            modelsList.data.map((model) => ({
                ID: model.id,
                Yaratilgan: new Date(model.created * 1000).toLocaleDateString(),
                Ega: model.owned_by,
            })),
        );
    } catch (error) {
        console.error("❌ Modellarni olishda xatolik yuz berdi:", error);
    }
}

listAllAvailableModels();
