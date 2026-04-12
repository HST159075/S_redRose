import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import routes from "./routes/index.js";
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// ── Uploads folder তৈরি করো (না থাকলে) ────────────────────────
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
// ── CORS ────────────────────────────────────────────────────────
app.use(cors({
    origin: [
        process.env.FRONTEND_URL ?? "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:5000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// ⚡ Better Auth — /api/auth/* সব route এটাই handle করে
// এটা express.json() এর আগে থাকতে হবে
app.all("/api/auth/*all", toNodeHandler(auth));
// ── Body Parsers ────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// ── Static Files (Uploaded Images) ─────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
// ── API Routes ──────────────────────────────────────────────────
app.use("/api", routes);
// ── Health Check ────────────────────────────────────────────────
app.get("/health", (_req, res) => {
    res.json({
        success: true,
        message: "Red Rose Cosmetic Shop API is running 🌹",
        timestamp: new Date().toISOString(),
    });
});
// ── 404 Handler ─────────────────────────────────────────────────
app.use("*all", (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
});
// ── Global Error Handler ────────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error("❌ Error:", err.message);
    res.status(err.status ?? 500).json({
        success: false,
        message: err.message ?? "Internal Server Error",
    });
});
export default app;
