import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email.js";
export const auth = betterAuth({
    baseURL: "http://localhost:5000",
    basePath: "/api/auth",
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
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
        callbackURL: "http://localhost:3000/login",
        sendVerificationEmail: async ({ user, url }) => {
            await sendVerificationEmail(user.email, user.name, url);
        },
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
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
    trustedOrigins: [process.env.FRONTEND_URL || "http://localhost:3000"],
    advanced: {
        defaultCookieAttributes: {
            sameSite: "lax",
            secure: false,
        },
    },
});
