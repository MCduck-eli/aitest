"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initTelegramBot = exports.sendTestReport = exports.bot = void 0;
const telegraf_1 = require("telegraf");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const botToken = process.env.BOT_TOKEN;
const adminChatId = process.env.ADMIN_CHAT_ID;
if (!botToken) {
    console.error("❌ Xatolik: .env faylida BOT_TOKEN topilmadi!");
}
exports.bot = new telegraf_1.Telegraf(botToken || "");
const sendTestReport = async (reportData) => {
    try {
        if (!adminChatId) {
            throw new Error("ADMIN_CHAT_ID sozlanmagan.");
        }
        const { studentName, score, violations, status, reason, photoBase64 } = reportData;
        const message = `
📊 *YANGI IMTIHON NATIJASI* 📊

👤 *Talaba:* ${studentName}
💯 *To'plangan Ball:* ${score} ta to'g'ri
⚠️ *Qoidabuzarliklar soni:* ${violations} marta
🟢 *Status:* ${status === "passed" ? "✅ O'tdi" : "❌ Yiqildi"}
${reason ? `📝 *Izoh/Sabab:* ${reason}` : ""}

⚡️ _AI Proctoring Tizimi tomonidan avtomatik yuborildi._
    `;
        if (photoBase64 && photoBase64.startsWith("data:image")) {
            const base64Data = photoBase64.replace(/^data:image\/\w+;base64,/, "");
            const imageBuffer = Buffer.from(base64Data, "base64");
            await exports.bot.telegram.sendPhoto(adminChatId, { source: imageBuffer }, {
                caption: message,
                parse_mode: "Markdown",
            });
        }
        else {
            await exports.bot.telegram.sendMessage(adminChatId, message, {
                parse_mode: "Markdown",
            });
        }
        console.log("📢 Natijalar muvaffaqiyatli Telegramga yuborildi.");
    }
    catch (error) {
        console.error("Telegram bot xabar yuborishda xatolik:", error);
    }
};
exports.sendTestReport = sendTestReport;
const initTelegramBot = () => {
    if (!botToken) {
        console.warn("⚠️ Telegram bot ishga tushmadi: BOT_TOKEN topilmadi.");
        return;
    }
    if (process.env.NODE_ENV === "production") {
        exports.bot.launch({ dropPendingUpdates: true });
    }
    else {
        exports.bot.launch();
    }
    console.log("🤖 Telegram Bot muvaffaqiyatli faollashtirildi.");
};
exports.initTelegramBot = initTelegramBot;
