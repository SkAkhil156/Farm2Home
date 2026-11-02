
import { Router } from "express";

import {
    getFarmerOrders,
    updateFarmerOrderStatus,
} from "../controllers/orderController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";

const router = Router();

// 1. Farmer only: View orders containing their products
router.get(
    "/farmer",
    protect,
    authorizeRoles("farmer"),
    getFarmerOrders
);

// 2. Farmer only: Update the status of their own order item
router.patch(
    "/:orderId/items/:itemId/status",
    protect,
    authorizeRoles("farmer"),
    updateFarmerOrderStatus
);

export default router;
