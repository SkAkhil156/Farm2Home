
import { Router } from "express";

import {
    createProduct,
    getProducts,
    getMyProducts,
    updateProduct,
    deleteProduct,
} from "../controllers/productController.js";

import { uploadProductImage } from "../controllers/imageController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import uploadImage from "../middleware/uploadImage.js";

const router = Router();

// 1. Public: View all active products
router.get("/", getProducts);

// 2. Farmer only: View their own products
router.get(
    "/my-products",
    protect,
    authorizeRoles("farmer"),
    getMyProducts
);

// 3. Farmer only: Upload a product image to Cloudinary
router.post(
    "/upload-image",
    protect,
    authorizeRoles("farmer"),
    uploadImage.single("image"),
    uploadProductImage
);

// 4. Farmer only: Create a new product
router.post(
    "/",
    protect,
    authorizeRoles("farmer"),
    createProduct
);

// 5. Farmer only: Update their own product
router.patch(
    "/:id",
    protect,
    authorizeRoles("farmer"),
    updateProduct
);

// 6. Farmer only: Delete their own product
router.delete(
    "/:id",
    protect,
    authorizeRoles("farmer"),
    deleteProduct
);

export default router;
