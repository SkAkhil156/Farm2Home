
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            index: true,
        },

        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        provider: {
            type: String,
            enum: ["cod", "razorpay"],
            required: true,
        },

        providerOrderId: {
            type: String,
            default: "",
        },

        providerPaymentId: {
            type: String,
            default: "",
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        currency: {
            type: String,
            default: "INR",
            enum: ["INR"],
        },

        status: {
            type: String,
            enum: [
                "Pending",
                "Authorized",
                "Paid",
                "Failed",
                "RefundPending",
                "Refunded",
            ],
            default: "Pending",
            index: true,
        },

        verifiedAt: {
            type: Date,
            default: null,
        },

        failureReason: {
            type: String,
            default: "",
            maxlength: 500,
        },
    },
    { timestamps: true }
);

paymentSchema.index({ provider: 1, providerPaymentId: 1 });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
