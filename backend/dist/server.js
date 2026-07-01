"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const test_routes_1 = __importDefault(require("./routes/test.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const results_routes_1 = __importDefault(require("./routes/results.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));
app.use((req, res, next) => {
    console.log(`📡 [${new Date().toLocaleTimeString()}] ${req.method} -> ${req.originalUrl}`);
    next();
});
app.use(express_1.default.json({
    limit: "50mb",
    verify: (req, res, buf) => {
        if (req.method === "GET")
            return;
        try {
            if (buf && buf.length) {
                JSON.parse(buf.toString());
            }
        }
        catch (e) {
            console.log("❌ JSON formatida xatolik:", e.message);
            const error = new Error("Noto'g'ri JSON formati! Ikkitalik (\") qo'shtirnoq ishlating.");
            error.status = 400;
            throw error;
        }
    },
}));
// Routes
app.use("/api/v1/auth", auth_routes_1.default);
app.use("/api/v1/admin", admin_routes_1.default);
app.use("/api/v1/results", results_routes_1.default);
app.use("/api/v1/tests", test_routes_1.default);
app.get("/", (req, res) => {
    res.send("AI Proctoring Backend API ishlamoqda...");
});
app.use((err, req, res, next) => {
    console.error("🔥 Serverda xatolik yuz berdi:", err.message);
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        success: false,
        error: err.message || "Tizimda kutilmagan xatolik.",
    });
});
exports.default = app;
