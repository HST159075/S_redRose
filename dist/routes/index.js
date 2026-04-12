// src/routes/index.ts
import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { requireAuth, requireAdmin } from "../middlewares/authMiddleware.js";
import { getAllProducts, getProductBySlug, createProduct, updateProduct, deleteProduct, } from "../controllers/productController.js";
import { getCategories, createCategory, updateCategory, deleteCategory, } from "../controllers/categoryController.js";
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart, } from "../controllers/cartController.js";
import { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, cancelOrder, } from "../controllers/orderController.js";
import { getProfile, updateProfile, getAllUsers, changeUserRole, getDashboardStats, } from "../controllers/userController.js";
import { addReview, deleteReview } from "../controllers/reviewController.js";
// ── Multer Setup ───────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "../../uploads");
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith("image/"))
            cb(null, true);
        else
            cb(new Error("Only image files are allowed!"));
    },
});
const router = Router();
// ═══════════════════════════════════════════════════════════
// 🟢 PUBLIC ROUTES
// ═══════════════════════════════════════════════════════════
router.get("/products", getAllProducts);
router.get("/products/:slug", getProductBySlug);
router.get("/categories", getCategories);
// ═══════════════════════════════════════════════════════════
// 🔵 USER ROUTES (Login Required)
// ═══════════════════════════════════════════════════════════
router.get("/user/profile", requireAuth, getProfile);
router.put("/user/profile", requireAuth, upload.single("image"), updateProfile);
router.get("/cart", requireAuth, getCart);
router.post("/cart", requireAuth, addToCart);
router.put("/cart/item/:itemId", requireAuth, updateCartItem);
router.delete("/cart/item/:itemId", requireAuth, removeFromCart);
router.delete("/cart", requireAuth, clearCart);
router.post("/orders", requireAuth, createOrder);
router.get("/orders/my", requireAuth, getMyOrders);
router.get("/orders/:id", requireAuth, getOrderById);
router.patch("/orders/:id/cancel", requireAuth, cancelOrder);
router.post("/reviews", requireAuth, addReview);
router.delete("/reviews/:id", requireAuth, deleteReview);
// ═══════════════════════════════════════════════════════════
// 🔴 ADMIN ROUTES (Admin Only)
// ═══════════════════════════════════════════════════════════
router.get("/admin/dashboard", requireAdmin, getDashboardStats);
router.post("/admin/products", requireAdmin, upload.single("mainImg"), createProduct);
router.put("/admin/products/:id", requireAdmin, upload.single("mainImg"), updateProduct);
router.delete("/admin/products/:id", requireAdmin, deleteProduct);
router.post("/admin/categories", requireAdmin, upload.single("image"), createCategory);
router.put("/admin/categories/:id", requireAdmin, upload.single("image"), updateCategory);
router.delete("/admin/categories/:id", requireAdmin, deleteCategory);
router.get("/admin/orders", requireAdmin, getAllOrders);
router.put("/admin/orders/:id/status", requireAdmin, updateOrderStatus);
router.get("/admin/users", requireAdmin, getAllUsers);
router.put("/admin/users/:id/role", requireAdmin, changeUserRole);
export default router;
