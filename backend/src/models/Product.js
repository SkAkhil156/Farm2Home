
import mongoose from "mongoose";

export const PRODUCT_CATEGORIES = [
    "grains",
    "pulses",
    "vegetables",
    "fruits",
    "dairy",
    "spices",
    "seeds",
    "nuts_dry_fruits",
    "honey",
    "oil_products",
    "organic_products",
    "fertilizers",
    "manure",
    "farming_tools",
    "irrigation",
    "animal_feed",
    "other",
];

export const PRODUCT_UNITS = [
    "kg",
    "gram",
    "litre",
    "ml",
    "piece",
    "bunch",
    "bag",
    "pack",
    "dozen",
];

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120,
            index: true,
        },

        category: {
            type: String,
            required: true,
            enum: PRODUCT_CATEGORIES,
            index: true,
        },

        subcategory: {
            type: String,
            trim: true,
            maxlength: 80,
            default: "",
            index: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
        },

        // Example: Sona Masoori, Basmati, Organic Red Rice
        variety: {
            type: String,
            trim: true,
            maxlength: 100,
            default: "",
        },

        brand: {
            type: String,
            trim: true,
            maxlength: 100,
            default: "",
        },

        price: {
            type: Number,
            required: true,
            min: 0.01,
            index: true,
        },

        unit: {
            type: String,
            required: true,
            enum: PRODUCT_UNITS,
            default: "kg",
        },

        // Quantity available for sale
        quantity: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },

        imageUrl: {
            type: String,
            trim: true,
            maxlength: 2048,
            default: "",
        },

        // Set this to true only when the farmer can substantiate the claim.
        isOrganic: {
            type: Boolean,
            default: false,
            index: true,
        },

        condition: {
            type: String,
            enum: ["fresh", "dried", "processed", "new"],
            default: "fresh",
        },

        // Optional farm or pickup location
        location: {
            type: String,
            trim: true,
            maxlength: 150,
            default: "",
            index: true,
        },

        tags: {
            type: [String],
            default: [],
            validate: {
                validator: (tags) =>
                    tags.length <= 15 &&
                    tags.every(
                        (tag) =>
                            typeof tag === "string" &&
                            tag.trim().length > 0 &&
                            tag.length <= 40
                    ),
                message: "A product can have up to 15 valid tags.",
            },
        },

        farmer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Useful indexes for common marketplace queries.
productSchema.index({ isActive: 1, category: 1, createdAt: -1 });
productSchema.index({ isActive: 1, price: 1 });
productSchema.index({ isActive: 1, isOrganic: 1, createdAt: -1 });

const Product = mongoose.model("Product", productSchema);

export default Product;
