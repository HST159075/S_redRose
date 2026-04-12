// src/server.ts
import "dotenv/config";
import app from "./app.js";
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`
🌹 ─────────────────────────────────────── 🌹
   Red Rose Cosmetic Shop — Backend
🚀 Server  : http://localhost:${PORT}
🏥 Health  : http://localhost:${PORT}/health
📦 Database: SQLite via Prisma ORM
🔐 Auth    : Better Auth (Email + Google)
💵 Payment : Cash on Delivery
🌹 ─────────────────────────────────────── 🌹
  `);
});
