
import { Router } from "express";

import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
} from "../controllers/cartController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";

const router = Router();

// All cart routes require customer authentication.
router.use(protect);
router.use(authorizeRoles("customer"));

// Get the logged-in customer's cart
router.get("/", getCart);

// Add a product to cart
router.post("/items", addToCart);

// Update cart product quantity
router.patch("/items/:productId", updateCartItem);

// Remove a product from cart
router.delete("/items/:productId", removeFromCart);

// Clear the entire cart
router.delete("/", clearCart);

export default router;
