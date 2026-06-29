import app from "./server";
import dotenv from "dotenv";
import { initTelegramBot } from "./service/telegram.service";

dotenv.config();

const PORT = Number(process.env.PORT || 5000);

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
