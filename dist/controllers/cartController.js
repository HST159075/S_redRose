// src/controllers/cartController.ts
import { prisma } from "../lib/prisma.js";
export const getCart = async (req, res) => {
    try {
        const cart = await prisma.cart.findUnique({
            where: { userId: req.user.id },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                mainImg: true,
                                regularPrice: true,
                                salePrice: true,
                                stock: true,
                            },
                        },
                    },
                },
            },
        });
        if (!cart) {
            res.json({ success: true, data: { items: [], total: 0 } });
            return;
        }
        const total = cart.items.reduce((sum, item) => {
            const price = item.product.salePrice ?? item.product.regularPrice;
            return sum + price * item.quantity;
        }, 0);
        res.json({ success: true, data: { ...cart, total } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        const userId = req.user.id;
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product || !product.isActive) {
            res.status(404).json({ success: false, message: "Product not found" });
            return;
        }
        if (product.stock < quantity) {
            res.status(400).json({ success: false, message: "Insufficient stock" });
            return;
        }
        let cart = await prisma.cart.findUnique({ where: { userId } });
        if (!cart)
            cart = await prisma.cart.create({ data: { userId } });
        const cartItem = await prisma.cartItem.upsert({
            where: { cartId_productId: { cartId: cart.id, productId } },
            update: { quantity: { increment: quantity } },
            create: { cartId: cart.id, productId, quantity },
        });
        res.json({ success: true, message: "Added to cart", data: cartItem });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;
        const { itemId } = req.params;
        if (quantity <= 0) {
            await prisma.cartItem.delete({ where: { id: itemId } });
            res.json({ success: true, message: "Item removed from cart" });
            return;
        }
        const item = await prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity },
        });
        res.json({ success: true, data: item });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const removeFromCart = async (req, res) => {
    try {
        await prisma.cartItem.delete({ where: { id: req.params.itemId } });
        res.json({ success: true, message: "Item removed from cart" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const clearCart = async (req, res) => {
    try {
        const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
        if (cart)
            await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        res.json({ success: true, message: "Cart cleared" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
