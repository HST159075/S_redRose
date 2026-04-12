// src/controllers/categoryController.ts

import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { CreateCategoryBody } from "../types/index.js";

const createSlug = (name: string): string =>
  name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const createCategory = async (
  req: Request<{}, {}, CreateCategoryBody>,
  res: Response
): Promise<void> => {
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
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const updateCategory = async (
  req: Request<{ id: string }, {}, Partial<CreateCategoryBody>>,
  res: Response
): Promise<void> => {
  try {
    const { name } = req.body;
    const updateData: Record<string, string> = {};

    if (name) {
      updateData.name = name;
      updateData.slug = createSlug(name);
    }
    if (req.file?.filename) updateData.image = req.file.filename;

    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const deleteCategory = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};