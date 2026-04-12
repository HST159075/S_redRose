// src/controllers/orderController.ts

import { Request, Response } from "express";

import { prisma } from "../lib/prisma.js";
import { sendOrderConfirmationEmail } from "../lib/email.js";
import { CreateOrderBody, OrderQueryParams, UpdateOrderStatusBody } from "../types/index.js";
import { Prisma, Product } from "../generated/prisma/browser.js";

type OrderItemWithProduct = Prisma.OrderItemGetPayload<{
  include: {
    product: { select: { name: true; mainImg: true } };
  };
}>;

const VALID_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

type OrderStatus = (typeof VALID_STATUSES)[number];

// ── Order তৈরি (Cash on Delivery) ────────────────────────────── USER
export const createOrder = async (
  req: Request<{}, {}, CreateOrderBody>,
  res: Response
): Promise<void> => {
  try {
    const { items, address, city, postalCode, phone, note } = req.body;
    const userId = req.user!.id;

    if (!items || items.length === 0) {
      res.status(400).json({ success: false, message: "Order items are required" });
      return;
    }

    if (!address || !phone || !city) {
      res.status(400).json({ success: false, message: "Address, city and phone are required" });
      return;
    }

    // Products verify করো
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });

    if (products.length !== items.length) {
      res.status(400).json({ success: false, message: "One or more products not found" });
      return;
    }

    // Stock check করো
    for (const item of items) {
      const product = products.find((p: Product) => p.id === item.productId)!;
      if (product.stock < item.quantity) {
        res.status(400).json({
          success: false,
          message: `"${product.name}" এর stock কম। Available: ${product.stock}`,
        });
        return;
      }
    }

    // Total calculate করো
    let totalAmount = 0;
    const orderItems = items.map((item) => {
      const product = products.find((p: Product) => p.id === item.productId)!;
      const price = product.salePrice ?? product.regularPrice;
      totalAmount += price * item.quantity;
      return { productId: item.productId, quantity: item.quantity, price };
    });

    const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Order create করো
      return tx.order.create({
        data: {
          userId,
          totalAmount,
          address,
          city,
          postalCode,
          phone,
          note,
          paymentMethod: "CASH_ON_DELIVERY",
          paymentStatus: "UNPAID",
          items: { create: orderItems },
        },
        include: {
          items: {
            include: {
              product: { select: { name: true, mainImg: true } },
            },
          },
          user: { select: { name: true, email: true } },
        },
      });
    });

    // Cart থেকে ordered items সরাও
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id, productId: { in: productIds } },
      });
    }

    // ✉️ Order Confirmation Email পাঠাও
    try {
      const emailItems = order.items.map((i: OrderItemWithProduct) => ({
        name: i.product.name,
        quantity: i.quantity,
        price: i.price,
      }));

      await sendOrderConfirmationEmail(
        order.user.email,
        order.user.name,
        order.id,
        emailItems,
        order.totalAmount,
        `${order.address}, ${order.city}`,
        order.phone
      );
    } catch (emailErr) {
      // Email fail হলেও order cancel করা যাবে না
      console.error("Order confirmation email failed:", emailErr);
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully! Confirmation email পাঠানো হয়েছে।",
      data: {
        orderId: order.id,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        status: order.status,
        items: order.items,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// ── আমার Orders ───────────────────────────────────────────────── USER
export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      include: {
        items: {
          include: { product: { select: { name: true, mainImg: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// ── Single Order দেখো ─────────────────────────────────────────── USER
export const getOrderById = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: {
          include: { product: { select: { name: true, mainImg: true, slug: true } } },
        },
      },
    });

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    // শুধু owner অথবা admin দেখতে পারবে
    if (order.userId !== req.user!.id && req.user!.role !== "ADMIN") {
      res.status(403).json({ success: false, message: "Forbidden" });
      return;
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// ── সব Orders (Admin) ─────────────────────────────────────────── ADMIN
export const getAllOrders = async (
  req: Request<{}, {}, {}, OrderQueryParams>,
  res: Response
): Promise<void> => {
  try {
    const { status, page = "1", limit = "20" } = req.query;
    const where = status ? { status: status as OrderStatus } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          items: { include: { product: { select: { name: true } } } },
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: Number(page),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// ── Order Status আপডেট ────────────────────────────────────────── ADMIN
export const updateOrderStatus = async (
  req: Request<{ id: string }, {}, UpdateOrderStatusBody>,
  res: Response
): Promise<void> => {
  try {
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status as OrderStatus)) {
      res.status(400).json({ success: false, message: "Invalid status" });
      return;
    }

    // DELIVERED হলে payment status PAID করো (COD তে delivery = payment)
    const updateData: { status: OrderStatus; paymentStatus?: "PAID" } = {
      status: status as OrderStatus,
    };

    if (status === "DELIVERED") {
      updateData.paymentStatus = "PAID";
    }

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: updateData,
      include: { user: { select: { name: true, email: true } } },
    });

    res.json({ success: true, message: "Order status updated", data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// ── Order Cancel করো (user নিজে) ────────────────────────────── USER
export const cancelOrder = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true },
    });

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    if (order.userId !== req.user!.id) {
      res.status(403).json({ success: false, message: "Forbidden" });
      return;
    }

    // শুধু PENDING অবস্থায় cancel করা যাবে
    if (order.status !== "PENDING") {
      res.status(400).json({
        success: false,
        message: `Order already ${order.status}. Cancel করা যাবে না।`,
      });
      return;
    }

    // Stock ফেরত দাও + cancel করো
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      await tx.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED" },
      });
    });

    res.json({ success: true, message: "Order cancelled successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};