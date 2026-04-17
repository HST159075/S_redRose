// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email.js";
const FRONTEND_URL = process.env.FRONTEND_URL ?? "https://red-rose-seven.vercel.app";
const BACKEND_URL = process.env.BETTER_AUTH_URL ?? "https://s-redrose-1.onrender.com";
const isProd = process.env.NODE_ENV === "production";
export const auth = betterAuth({
    baseURL: BACKEND_URL,
    basePath: "/api/auth",
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    trustedOrigins: [
        FRONTEND_URL,
        BACKEND_URL,
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    advanced: {
        defaultCookieAttributes: {
            sameSite: isProd ? "none" : "lax",
            secure: isProd,
            httpOnly: true,
            path: "/",
        },
        disableDefaultAllAllowedOrigins: false,
        // Cross-origin session handle করতে
        crossSubDomainCookies: {
            enabled: false,
        },
        useSecureCookies: isProd,
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        sendResetPassword: async ({ user, url }) => {
            await sendPasswordResetEmail(user.email, user.name, url);
        },
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        expiresIn: 60 * 60 * 24,
        callbackURL: `${FRONTEND_URL}/auth/login`,
        sendVerificationEmail: async ({ user, url }) => {
            await sendVerificationEmail(user.email, user.name, url);
        },
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
            redirectURI: `${BACKEND_URL}/api/auth/callback/google`,
        },
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60,
        },
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "USER",
                input: false,
            },
        },
    },
});
