// src/middlewares/authMiddleware.ts
import { auth } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";
// ── Login check ────────────────────────────────────────────────
export const requireAuth = async (req, res, next) => {
    try {
        const session = await auth.api.getSession({
            headers: req.headers,
        });
        if (!session?.user) {
            res.status(401).json({
                success: false,
                message: "Unauthorized. Please login first.",
            });
            return;
        }
        req.user = session.user;
        next();
    }
    catch {
        res.status(401).json({
            success: false,
            message: "Invalid or expired session.",
        });
    }
};
// ── Admin check ────────────────────────────────────────────────
export const requireAdmin = async (req, res, next) => {
    try {
        const session = await auth.api.getSession({
            headers: req.headers,
        });
        if (!session?.user) {
            res.status(401).json({
                success: false,
                message: "Unauthorized. Please login first.",
            });
            return;
        }
        // DB থেকে fresh role নাও (session cached হতে পারে)
        const dbUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true },
        });
        if (!dbUser || dbUser.role !== "ADMIN") {
            res.status(403).json({
                success: false,
                message: "Forbidden. Admin access required.",
            });
            return;
        }
        req.user = { ...session.user, role: dbUser.role };
        next();
    }
    catch {
        res.status(403).json({
            success: false,
            message: "Access denied.",
        });
    }
};
// ── Optional auth (login ছাড়াও কাজ করবে) ─────────────────────
export const optionalAuth = async (req, _res, next) => {
    try {
        const session = await auth.api.getSession({
            headers: req.headers,
        });
        req.user = session?.user ?? undefined;
    }
    catch {
        req.user = undefined;
    }
    next();
};
