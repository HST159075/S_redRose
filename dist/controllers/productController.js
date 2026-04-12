// src/controllers/productController.ts
import { prisma } from "../lib/prisma.js";
const createSlug = (name) => name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-") +
    "-" +
    Date.now();
// ── সব Products ──────────────────────────────────────────────── PUBLIC
export const getAllProducts = async (req, res) => {
    try {
        const { category, search, minPrice, maxPrice, page = "1", limit = "12" } = req.query;
        const where = { isActive: true };
        if (category)
            where.category = { slug: category };
        if (search)
            where.name = { contains: search, mode: "insensitive" };
        if (minPrice ?? maxPrice) {
            where.OR = [
                {
                    salePrice: {
                        gte: Number(minPrice) || 0,
                        lte: Number(maxPrice) || 999999,
                    },
                },
                {
                    regularPrice: {
                        gte: Number(minPrice) || 0,
                        lte: Number(maxPrice) || 999999,
                    },
                },
            ];
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    category: true,
                    reviews: { select: { rating: true } },
                },
                skip,
                take: Number(limit),
                orderBy: { createdAt: "desc" },
            }),
            prisma.product.count({ where }),
        ]);
        const productsWithRating = products.map((p) => ({
            ...p,
            avgRating: p.reviews.length > 0
                ? p.reviews.reduce((a, b) => a + b.rating, 0) / p.reviews.length
                : null,
            totalReviews: p.reviews.length,
        }));
        res.json({
            success: true,
            data: productsWithRating,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// ── Single Product ────────────────────────────────────────────── PUBLIC
export const getProductBySlug = async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: { slug: req.params.slug },
            include: {
                category: true,
                reviews: {
                    include: {
                        user: { select: { name: true, image: true } },
                    },
                    orderBy: { createdAt: "desc" },
                },
            },
        });
        if (!product) {
            res.status(404).json({ success: false, message: "Product not found" });
            return;
        }
        res.json({ success: true, data: product });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// ── Product তৈরি ──────────────────────────────────────────────── ADMIN
export const createProduct = async (req, res) => {
    try {
        const { name, description, regularPrice, salePrice, stock, categoryId, hoverImg } = req.body;
        if (!name || !regularPrice) {
            res.status(400).json({ success: false, message: "Name and regular price are required" });
            return;
        }
        const mainImg = (req.file?.filename ?? req.body.mainImg);
        if (!mainImg) {
            res.status(400).json({ success: false, message: "Main image is required" });
            return;
        }
        const product = await prisma.product.create({
            data: {
                name,
                slug: createSlug(name),
                description,
                regularPrice: parseFloat(regularPrice),
                salePrice: salePrice ? parseFloat(salePrice) : null,
                mainImg,
                hoverImg,
                stock: parseInt(stock ?? "0"),
                categoryId: categoryId ?? null,
            },
        });
        res.status(201).json({ success: true, message: "Product created", data: product });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// ── Product আপডেট ─────────────────────────────────────────────── ADMIN
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData = { ...req.body };
        if (req.file?.filename)
            updateData.mainImg = req.file.filename;
        if (updateData.regularPrice)
            updateData.regularPrice = parseFloat(updateData.regularPrice);
        if (updateData.salePrice)
            updateData.salePrice = parseFloat(updateData.salePrice);
        if (updateData.stock)
            updateData.stock = parseInt(updateData.stock);
        if (updateData.name)
            updateData.slug = createSlug(updateData.name);
        if (updateData.isActive !== undefined)
            updateData.isActive = updateData.isActive === "true";
        const product = await prisma.product.update({ where: { id }, data: updateData });
        res.json({ success: true, message: "Product updated", data: product });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// ── Product ডিলিট ─────────────────────────────────────────────── ADMIN
export const deleteProduct = async (req, res) => {
    try {
        await prisma.product.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: "Product deleted" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
