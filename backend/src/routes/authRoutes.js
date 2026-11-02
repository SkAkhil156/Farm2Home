
import { Router } from "express";
import { register, login } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", protect, (req, res) => {
    res.status(200).json({
        success: true,
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role
        }
    });
});

router.get(
    "/farmer-test",
    protect,
    authorizeRoles("farmer"),
    (req, res) => {
        res.status(200).json({
            success: true,
            message: "Farmer access granted."
        });
    }
);

export default router;
