
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function protect(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please log in."
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token."
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.sub);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User account not found."
            });
        }

        req.user = user;

        next();
    } catch (error) {
        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token. Please log in again."
            });
        }

        next(error);
    }
}
