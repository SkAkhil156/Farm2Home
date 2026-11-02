
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },

        farmer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        productName: {
            type: String,
            required: true,
            trim: true,
        },

        quantity: {
            type: Number,
            required: true,
            min: 1,
        },

        unit: {
            type: String,
            required: true,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        status: {
            type: String,
            enum: [
                "Pending",
                "Confirmed",
                "Processing",
                "Shipped",
                "Delivered",
                "Cancelled",
            ],
            default: "Pending",
        },
    },
    { timestamps: true }
);

const orderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        items: {
            type: [orderItemSchema],
            validate: {
                validator: (items) => items.length > 0,
                message: "An order must contain at least one product.",
            },
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },

        shippingAddress: {
            name: { type: String, required: true, trim: true },
            phone: { type: String, required: true, trim: true },
            village: { type: String, required: true, trim: true },
            district: { type: String, required: true, trim: true },
            state: { type: String, required: true, trim: true },
            pincode: { type: String, required: true, trim: true },
        },

        paymentMethod: {
            type: String,
            enum: ["COD", "Online"],
            default: "COD",
        },

        paymentStatus: {
            type: String,
            enum: ["Pending", "Paid", "Failed", "Refunded"],
            default: "Pending",
        },
    },
    { timestamps: true }
);

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ "items.farmer": 1, createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
