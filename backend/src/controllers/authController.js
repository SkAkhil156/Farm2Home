
import bcrypt from "bcryptjs";
import { z } from "zod";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const registerSchema = z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(254),
    password: z.string().min(8).max(72),
    role: z.enum(["customer", "farmer"]),
    phone: z.string().trim().max(20).optional()
});

export async function register(req, res, next) {
    try {
        // Validate the request body
        const result = registerSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Please check your registration details.",
                errors: result.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message
                }))
            });
        }

        const { name, email, password, role, phone } = result.data;
        const normalizedEmail = email.toLowerCase();

        // Check for an existing account
        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        // Hash the password before storing it
        const passwordHash = await bcrypt.hash(password, 12);

        const user = await User.create({
            name,
            email: normalizedEmail,
            passwordHash,
            role,
            ...(phone ? { phone } : {})
        });

        // Never return the password or password hash
        return res.status(201).json({
            success: true,
            message: "Registration successful.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        // Handle concurrent duplicate registrations
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        next(error);
    }
}




export async function login(req, res, next) {
    try {
        const loginSchema = z.object({
            email: z.string().trim().email().max(254),
            password: z.string().min(1).max(72)
        });

        const result = loginSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email and password."
            });
        }

        const email = result.data.email.toLowerCase();
        const { password } = result.data;

        // passwordHash is excluded by default in the User model,
        // so explicitly select it for password verification.
        const user = await User.findOne({ email }).select("+passwordHash");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Issue a short-lived signed JWT.
        const token = jwt.sign(
            { sub: user._id.toString() },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
}
