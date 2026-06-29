import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import testRoutes from "./routes/test.routes";
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import resultsRoutes from "./routes/results.routes";

const app: Application = express();

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    }),
);

app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(
        `📡 [${new Date().toLocaleTimeString()}] ${req.method} -> ${req.originalUrl}`,
    );
    next();
});

app.use(
    express.json({
        limit: "50mb",
        verify: (req: Request, res: Response, buf: Buffer) => {
            if (req.method === "GET") return;
            try {
                if (buf && buf.length) {
                    JSON.parse(buf.toString());
                }
            } catch (e: any) {
                console.log("❌ JSON formatida xatolik:", e.message);
                const error: any = new Error(
                    "Noto'g'ri JSON formati! Ikkitalik (\") qo'shtirnoq ishlating.",
                );
                error.status = 400;
                throw error;
            }
        },
    }),
);

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/results", resultsRoutes);
app.use("/api/v1/tests", testRoutes);

app.get("/", (req: Request, res: Response) => {
    res.send("AI Proctoring Backend API ishlamoqda...");
});
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("🔥 Serverda xatolik yuz berdi:", err.message);
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        success: false,
        error: err.message || "Tizimda kutilmagan xatolik.",
    });
});

export default app;
