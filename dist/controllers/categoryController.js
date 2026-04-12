// src/controllers/categoryController.ts
import { prisma } from "../lib/prisma.js";
const createSlug = (name) => name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
export const getCategories = async (_req, res) => {
    try {
        const categories = await prisma.category.findMany({
            include: { _count: { select: { products: true } } },
        });
        res.json({ success: true, data: categories });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const image = req.file?.filename ?? req.body.image;
        if (!name) {
            res.status(400).json({ success: false, message: "Category name is required" });
            return;
        }
        const category = await prisma.category.create({
            data: { name, slug: createSlug(name), image },
        });
        res.status(201).json({ success: true, data: category });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const updateCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const updateData = {};
        if (name) {
            updateData.name = name;
            updateData.slug = createSlug(name);
        }
        if (req.file?.filename)
            updateData.image = req.file.filename;
        const category = await prisma.category.update({
            where: { id: req.params.id },
            data: updateData,
        });
        res.json({ success: true, data: category });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const deleteCategory = async (req, res) => {
    try {
        await prisma.category.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: "Category deleted" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
