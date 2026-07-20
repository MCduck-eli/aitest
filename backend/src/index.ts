import app from "./server";
import dotenv from "dotenv";
import { initTelegramBot } from "./service/telegram.service";
import { initializeDatabase } from "./config/init-db";

dotenv.config();

const PORT = Number(process.env.PORT || 5000);

// Initialize database first, then start server
const startServer = async () => {
    try {
        console.log("🗄️  Initializing database...");
        await initializeDatabase();
        console.log("✅ Database initialized");

        app.listen(PORT, () => {
            console.log(
                `🚀 Server http://localhost:${PORT} manzili bo'yicha ishga tushdi`,
            );

            if (process.env.ENABLE_TELEGRAM === "true") {
                initTelegramBot();
            } else {
                console.log("ℹ️ Telegram bot o'chirilgan holatda ishga tushdi.");
            }
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};

startServer();

// Trigger reload

// Auto-cleanup for 24-hour old exam results (runs every hour)
import { query } from "./config/database";
setInterval(async () => {
    try {
        const res = await query(`
            DELETE FROM exam_results 
            WHERE is_ai_exam = true 
              AND created_at < NOW() - INTERVAL '24 hours'
        `);
        if (res.rowCount && res.rowCount > 0) {
            console.log(`🧹 Auto-cleanup: Deleted ${res.rowCount} old exam results.`);
        }
    } catch (err) {
        console.error("Auto-cleanup failed:", err);
    }
}, 1000 * 60 * 60); // 1 hour
