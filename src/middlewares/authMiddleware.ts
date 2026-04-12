// src/middlewares/authMiddleware.ts

import { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";
import { AuthUser } from "../types/index.js";

// Express Request কে extend করো
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// ── Login check ────────────────────────────────────────────────
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as Record<string, string>,
    });

    if (!session?.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first.",
      });
      return;
    }

    req.user = session.user as AuthUser;
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired session.",
    });
  }
};

// ── Admin check ────────────────────────────────────────────────
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as Record<string, string>,
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

    req.user = { ...session.user, role: dbUser.role } as AuthUser;
    next();
  } catch {
    res.status(403).json({
      success: false,
      message: "Access denied.",
    });
  }
};

// ── Optional auth (login ছাড়াও কাজ করবে) ─────────────────────
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as Record<string, string>,
    });
    req.user = (session?.user as AuthUser) ?? undefined;
  } catch {
    req.user = undefined;
  }
  next();
};
