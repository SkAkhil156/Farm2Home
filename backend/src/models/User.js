
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: 254
        },

        passwordHash: {
            type: String,
            required: true,
            select: false
        },

        phone: {
            type: String,
            trim: true
        },

        role: {
            type: String,
            enum: ["customer", "farmer", "admin"],
            default: "customer",
            required: true
        },

        address: {
            village: { type: String, trim: true },
            district: { type: String, trim: true },
            state: { type: String, trim: true },
            pincode: { type: String, trim: true }
        },

        isVerified: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

export default User;
