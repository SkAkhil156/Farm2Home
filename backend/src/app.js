
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";

import { errorMiddleware } from "./middleware/errorMiddleware.js";

const app = express();

// 1. Security-related HTTP headers
app.use(helmet());

// 2. Allow requests from the React frontend
app.use(
    cors({
        origin:
            process.env.CLIENT_URL || "http://localhost:5173",
    })
);

// 3. Parse incoming JSON request bodies
app.use(express.json({ limit: "1mb" }));

// 4. Limit repeated requests to the API
app.use(
    "/api",
    rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 200,
        standardHeaders: "draft-8",
        legacyHeaders: false,
    })
);

// 5. Register API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);

// 6. Health-check endpoint
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Farm2Home backend is running",
    });
});

// 7. Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found",
    });
});

// 8. Centralized error-handling middleware
// Keep this after all routes and the 404 handler.
app.use(errorMiddleware);

export default app;
