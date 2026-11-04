
import { Router } from "express";

import {
    createOrder,
    getFarmerOrders,
    updateFarmerOrderStatus,
} from "../controllers/orderController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";

const router = Router();

// =====================================================
// CUSTOMER ROUTES
// =====================================================

// Customer only: Place a new Cash on Delivery order
router.post(
    "/",
    protect,
    authorizeRoles("customer"),
    createOrder
);


// =====================================================
// FARMER ROUTES
// =====================================================

// Farmer only: View orders containing their products
router.get(
    "/farmer",
    protect,
    authorizeRoles("farmer"),
    getFarmerOrders
);

// Farmer only: Update the status of their own order item
router.patch(
    "/:orderId/items/:itemId/status",
    protect,
    authorizeRoles("farmer"),
    updateFarmerOrderStatus
);

export default router;
