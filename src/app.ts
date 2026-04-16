import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import routes from "./routes/index.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ── CORS ────────────────────────────────────────────────────────
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL ?? "https://red-rose-seven.vercel.app",
      "http://localhost:5173",
      "https://red-rose-seven.vercel.app",
      "https://s-redrose-1.onrender.com",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.set("trust proxy", 1);
app.all("/api/auth/*all", toNodeHandler(auth));

// ── Body Parsers ────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static Files (Uploaded Images) ─────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ── API Routes ──────────────────────────────────────────────────
app.use("/api", routes);

// ── Health Check ────────────────────────────────────────────────
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Red Rose Cosmetic Shop API is running 🌹",
    timestamp: new Date().toISOString(),
  });
});
app.get("/", (req, res) => {
  res.send("Server-Rose is running...!!");
});

// ── 404 Handler ─────────────────────────────────────────────────
app.use("*all", (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ── Global Error Handler ────────────────────────────────────────
app.use(
  (
    err: Error & { status?: number },
    _req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    console.error("❌ Error:", err.message);
    res.status(err.status ?? 500).json({
      success: false,
      message: err.message ?? "Internal Server Error",
    });
  },
);

export default app;
