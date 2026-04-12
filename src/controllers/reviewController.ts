// src/controllers/reviewController.ts

import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AddReviewBody } from "../types/index.js";

export const addReview = async (
  req: Request<{}, {}, AddReviewBody>,
  res: Response
): Promise<void> => {
  try {
    const { productId, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
      return;
    }

    const review = await prisma.review.upsert({
      where: { userId_productId: { userId: req.user!.id, productId } },
      update: { rating: Number(rating), comment },
      create: { userId: req.user!.id, productId, rating: Number(rating), comment },
      include: { user: { select: { name: true, image: true } } },
    });

    res.status(201).json({ success: true, message: "Review submitted", data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const deleteReview = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const review = await prisma.review.findUnique({ where: { id: req.params.id } });

    if (!review) {
      res.status(404).json({ success: false, message: "Review not found" });
      return;
    }

    // Owner অথবা Admin ডিলিট করতে পারবে
    if (review.userId !== req.user!.id && req.user!.role !== "ADMIN") {
      res.status(403).json({ success: false, message: "Not authorized" });
      return;
    }

    await prisma.review.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
