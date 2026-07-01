"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("./server"));
const dotenv_1 = __importDefault(require("dotenv"));
const telegram_service_1 = require("./service/telegram.service");
const init_db_1 = require("./config/init-db");
dotenv_1.default.config();
const PORT = Number(process.env.PORT || 5000);
// Initialize database first, then start server
const startServer = async () => {
    try {
        console.log("🗄️  Initializing database...");
        await (0, init_db_1.initializeDatabase)();
        console.log("✅ Database initialized");
        server_1.default.listen(PORT, () => {
            console.log(`🚀 Server http://localhost:${PORT} manzili bo'yicha ishga tushdi`);
            if (process.env.ENABLE_TELEGRAM === "true") {
                (0, telegram_service_1.initTelegramBot)();
            }
            else {
                console.log("ℹ️ Telegram bot o'chirilgan holatda ishga tushdi.");
            }
        });
    }
    catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};
startServer();
