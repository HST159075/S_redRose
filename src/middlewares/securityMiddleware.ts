import { Request, Response, NextFunction } from "express";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
}

export const rateLimit = (options: RateLimitOptions) => {
  const { windowMs, max, message = "Too many requests. Please try again later." } = options;

  // Cleanup old entries every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) rateLimitStore.delete(key);
    }
  }, 5 * 60 * 1000);

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const key = `${ip}:${req.path}`;
    const now = Date.now();

    const entry = rateLimitStore.get(key);

    if (!entry || entry.resetTime < now) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      next();
      return;
    }

    if (entry.count >= max) {
      res.status(429).json({ success: false, message });
      return;
    }

    entry.count++;
    next();
  };
};

// ── Security Headers ───────────────────────────────────────────
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  // Production এ HTTPS force করো
  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }
  next();
};

// ── Sanitize input (basic XSS prevention) ─────────────────────
export const sanitizeInput = (req: Request, _res: Response, next: NextFunction): void => {
  const sanitize = (obj: Record<string, unknown>): Record<string, unknown> => {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      if (typeof value === "string") {
        // Basic XSS prevention — script tags সরাও
        result[key] = value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/javascript:/gi, "")
          .trim();
      } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        result[key] = sanitize(value as Record<string, unknown>);
      } else {
        result[key] = value;
      }
    }
    return result;
  };

  if (req.body && typeof req.body === "object") {
    req.body = sanitize(req.body);
  }
  next();
};

// ── Auth rate limiters ─────────────────────────────────────────
// Login: 10 attempts per 15 minutes
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many login attempts. Please try again after 15 minutes.",
});

// General API: 100 requests per minute
export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: "Too many requests. Please slow down.",
});

// Upload: 20 requests per hour
export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: "Too many uploads. Please try again later.",
});
