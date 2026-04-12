// src/controllers/userController.ts
import { prisma } from "../lib/prisma.js";
import { Role } from "../generated/prisma/enums.js";
// ── নিজের Profile ─────────────────────────────────────────────── USER
export const getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                createdAt: true,
            },
        });
        res.json({ success: true, data: user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// ── Profile আপডেট ─────────────────────────────────────────────── USER
export const updateProfile = async (req, res) => {
    try {
        const { name } = req.body;
        const image = req.file?.filename;
        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                ...(name && { name }),
                ...(image && { image }),
            },
            select: { id: true, name: true, email: true, image: true, role: true },
        });
        res.json({ success: true, message: "Profile updated", data: user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// ── সব Users ──────────────────────────────────────────────────── ADMIN
export const getAllUsers = async (req, res) => {
    try {
        const { page = "1", limit = "20" } = req.query;
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    _count: { select: { orders: true } },
                },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                orderBy: { createdAt: "desc" },
            }),
            prisma.user.count(),
        ]);
        res.json({
            success: true,
            data: users,
            pagination: {
                page: Number(page),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// ── Role পরিবর্তন ─────────────────────────────────────────────── ADMIN
export const changeUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!Object.values(Role).includes(role)) {
            res.status(400).json({
                success: false,
                message: "Invalid role. Must be USER or ADMIN",
            });
            return;
        }
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { role },
            select: { id: true, name: true, email: true, role: true },
        });
        res.json({ success: true, message: `User role changed to ${role}`, data: user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// ── Dashboard Stats ────────────────────────────────────────────── ADMIN
export const getDashboardStats = async (_req, res) => {
    try {
        const [totalUsers, totalProducts, totalOrders, revenue, recentOrders, lowStockProducts] = await Promise.all([
            prisma.user.count(),
            prisma.product.count({ where: { isActive: true } }),
            prisma.order.count(),
            prisma.order.aggregate({
                where: { status: { not: "CANCELLED" } },
                _sum: { totalAmount: true },
            }),
            prisma.order.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                include: { user: { select: { name: true } } },
            }),
            prisma.product.findMany({
                where: { stock: { lte: 5 }, isActive: true },
                select: { id: true, name: true, stock: true },
                take: 10,
            }),
        ]);
        res.json({
            success: true,
            data: {
                totalUsers,
                totalProducts,
                totalOrders,
                totalRevenue: revenue._sum.totalAmount ?? 0,
                recentOrders,
                lowStockProducts,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
