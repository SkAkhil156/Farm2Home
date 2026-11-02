
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./src/models/User.js";

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const name = process.env.ADMIN_NAME;
        const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const password = process.env.ADMIN_PASSWORD;

        if (!name || !email || !password) {
            throw new Error(
                "Please configure the admin details in your .env file."
            );
        }

        if (password.length < 12 || password.length > 72) {
            throw new Error("Admin password must be 12–72 characters.");
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            throw new Error(
                "This email already exists. No account was changed."
            );
        }

        const passwordHash = await bcrypt.hash(password, 12);

        await User.create({
            name,
            email,
            passwordHash,
            role: "admin",
            isVerified: true,
        });

        console.log("Admin account created successfully.");
    } catch (error) {
        console.error("Error:", error.message);
        process.exitCode = 1;
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    }
}

createAdmin();
