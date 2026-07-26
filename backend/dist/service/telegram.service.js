"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initTelegramBot = exports.sendTestReport = exports.sendTelegramMessage = exports.bot = void 0;
const telegraf_1 = require("telegraf");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const botToken = process.env.BOT_TOKEN;
const adminChatId = process.env.ADMIN_CHAT_ID;
const superAdminChatId = process.env.SUPER_ADMIN_CHAT_ID;
if (!botToken) {
    console.error("❌ Xatolik: .env faylida BOT_TOKEN topilmadi!");
}
exports.bot = new telegraf_1.Telegraf(botToken || "");
const sendTelegramMessage = async (chatId, message) => {
    try {
        if (!chatId) {
            console.warn("Telegram chat ID mavjud emas, xabar yuborilmadi.");
            return;
        }
        await exports.bot.telegram.sendMessage(chatId, message, {
            parse_mode: "Markdown",
        });
        console.log("📢 Telegramga xabar muvaffaqiyatli yuborildi.");
    }
    catch (error) {
        console.error("Telegram bot xabar yuborishda xatolik:", error);
    }
};
exports.sendTelegramMessage = sendTelegramMessage;
const sendTestReport = async (reportData) => {
    try {
        if (!adminChatId && !superAdminChatId) {
            throw new Error("ADMIN_CHAT_ID yoki SUPER_ADMIN_CHAT_ID sozlanmagan.");
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
            if (adminChatId) {
                await exports.bot.telegram.sendPhoto(adminChatId, { source: imageBuffer }, {
                    caption: message,
                    parse_mode: "Markdown",
                });
            }
            if (superAdminChatId) {
                await exports.bot.telegram.sendPhoto(superAdminChatId, { source: imageBuffer }, {
                    caption: message,
                    parse_mode: "Markdown",
                });
            }
        }
        else {
            if (adminChatId) {
                await exports.bot.telegram.sendMessage(adminChatId, message, {
                    parse_mode: "Markdown",
                });
            }
            if (superAdminChatId) {
                await exports.bot.telegram.sendMessage(superAdminChatId, message, {
                    parse_mode: "Markdown",
                });
            }
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
