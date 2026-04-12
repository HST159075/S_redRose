// src/types/index.ts

import { Request } from "express";
import { Role } from "../generated/prisma/enums.js";


// ── Multer — req.file এর জন্য ─────────────────────────────────
declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
      files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
    }
  }
}

// ── Authenticated User type ────────────────────────────────────
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: Role;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ── Extended Express Request with user ────────────────────────
export interface AuthRequest extends Request {
  user: AuthUser;
}

// ── Request body types ────────────────────────────────────────

export interface CreateProductBody {
  name: string;
  description?: string;
  regularPrice: string; // FormData থেকে string আসে
  salePrice?: string;
  stock?: string;
  categoryId?: string;
  mainImg?: string;
  hoverImg?: string;
}

export interface UpdateProductBody extends Partial<CreateProductBody> {
  isActive?: string;
}

export interface CreateOrderBody {
  items: { productId: string; quantity: number }[];
  address: string;
  city: string;
  postalCode?: string;
  phone: string;
  note?: string;
}

export interface AddToCartBody {
  productId: string;
  quantity?: number;
}

export interface UpdateCartItemBody {
  quantity: number;
}

export interface AddReviewBody {
  productId: string;
  rating: number;
  comment?: string;
}

export interface ChangeRoleBody {
  role: Role;
}

export interface UpdateOrderStatusBody {
  status: string;
}

export interface CreateCategoryBody {
  name: string;
  image?: string;
}

// ── API Response type ─────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    limit?: number;
    total: number;
    totalPages: number;
  };
}

// ── Product query params ──────────────────────────────────────
export interface ProductQueryParams {
  category?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
  limit?: string;
}

export interface OrderQueryParams {
  status?: string;
  page?: string;
  limit?: string;
}

export interface UserQueryParams {
  page?: string;
  limit?: string;
}