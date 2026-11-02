
import { z } from "zod";
import mongoose from "mongoose";
import Product, {
    PRODUCT_CATEGORIES,
    PRODUCT_UNITS,
} from "../models/Product.js";

const categorySchema = z.enum(PRODUCT_CATEGORIES);
const unitSchema = z.enum(PRODUCT_UNITS);

const optionalText = (max) =>
    z.string().trim().max(max).optional();

const createProductSchema = z.object({
    name: z.string().trim().min(2).max(120),
    category: categorySchema,
    subcategory: optionalText(80),
    description: z.string().trim().min(5).max(2000),
    variety: optionalText(100),
    brand: optionalText(100),
    price: z.coerce.number().positive().finite(),
    unit: unitSchema,
    quantity: z.coerce.number().min(0).finite(),
    imageUrl: z.string().trim().max(2048).optional(),
    isOrganic: z.boolean().optional(),
    condition: z.enum(["fresh", "dried", "processed", "new"]).optional(),
    location: optionalText(150),
    tags: z.array(z.string().trim().min(1).max(40)).max(15).optional(),
}).strict();

const updateProductSchema = createProductSchema
    .partial()
    .strict()
    .refine(
        (data) => Object.keys(data).length > 0,
        { message: "Provide at least one field to update." }
    );

function sendValidationError(res, result, message) {
    return res.status(400).json({
        success: false,
        message,
        errors: result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
        })),
    });
}

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// POST /api/products
export async function createProduct(req, res, next) {
    try {
        const result = createProductSchema.safeParse(req.body);

        if (!result.success) {
            return sendValidationError(
                res,
                result,
                "Please check your product details."
            );
        }

        const product = await Product.create({
            ...result.data,
            farmer: req.user._id,
        });

        return res.status(201).json({
            success: true,
            message: "Product created successfully.",
            product,
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/products
export async function getProducts(req, res, next) {
    try {
        const {
            search,
            category,
            subcategory,
            minPrice,
            maxPrice,
            isOrganic,
            inStock,
            condition,
            location,
            sort = "newest",
            page = "1",
            limit = "12",
        } = req.query;

        const filter = { isActive: true };

        // Search across product names, descriptions, varieties, brands and tags.
        if (typeof search === "string" && search.trim()) {
            const term = escapeRegex(search.trim().slice(0, 100));
            const regex = { $regex: term, $options: "i" };

            filter.$or = [
                { name: regex },
                { description: regex },
                { subcategory: regex },
                { variety: regex },
                { brand: regex },
                { tags: regex },
            ];
        }

        if (category !== undefined) {
            if (!PRODUCT_CATEGORIES.includes(category)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product category.",
                    allowedCategories: PRODUCT_CATEGORIES,
                });
            }

            filter.category = category;
        }

        if (subcategory !== undefined) {
            if (typeof subcategory !== "string" || !subcategory.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide a valid subcategory.",
                });
            }

            filter.subcategory = {
                $regex: `^${escapeRegex(subcategory.trim())}$`,
                $options: "i",
            };
        }

        if (location !== undefined) {
            if (typeof location !== "string" || !location.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide a valid location.",
                });
            }

            filter.location = {
                $regex: escapeRegex(location.trim()),
                $options: "i",
            };
        }

        if (isOrganic !== undefined) {
            if (!["true", "false"].includes(isOrganic)) {
                return res.status(400).json({
                    success: false,
                    message: "isOrganic must be true or false.",
                });
            }

            filter.isOrganic = isOrganic === "true";
        }

        if (inStock !== undefined) {
            if (!["true", "false"].includes(inStock)) {
                return res.status(400).json({
                    success: false,
                    message: "inStock must be true or false.",
                });
            }

            if (inStock === "true") {
                filter.quantity = { $gt: 0 };
            } else {
                filter.quantity = 0;
            }
        }

        if (condition !== undefined) {
            if (!["fresh", "dried", "processed", "new"].includes(condition)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product condition.",
                });
            }

            filter.condition = condition;
        }

        // Validate the price range.
        let min;
        let max;

        if (minPrice !== undefined) {
            min = Number(minPrice);
        }

        if (maxPrice !== undefined) {
            max = Number(maxPrice);
        }

        if (
            (min !== undefined && (!Number.isFinite(min) || min < 0)) ||
            (max !== undefined && (!Number.isFinite(max) || max < 0)) ||
            (min !== undefined && max !== undefined && min > max)
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid price range.",
            });
        }

        if (min !== undefined || max !== undefined) {
            filter.price = {};

            if (min !== undefined) filter.price.$gte = min;
            if (max !== undefined) filter.price.$lte = max;
        }

        // Sorting is allowlisted to avoid arbitrary query behavior.
        const sortOptions = {
            newest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            price_low: { price: 1, createdAt: -1 },
            price_high: { price: -1, createdAt: -1 },
            name_asc: { name: 1 },
            name_desc: { name: -1 },
        };

        if (!Object.hasOwn(sortOptions, sort)) {
            return res.status(400).json({
                success: false,
                message: "Invalid sort option.",
                allowedSortOptions: Object.keys(sortOptions),
            });
        }

        const parsedPage = Number(page);
        const parsedLimit = Number(limit);

        if (
            !/^[1-9]\d*$/.test(String(page)) ||
            !/^[1-9]\d*$/.test(String(limit)) ||
            !Number.isSafeInteger(parsedPage) ||
            !Number.isSafeInteger(parsedLimit) ||
            parsedPage > 1000000 ||
            parsedLimit > 50
        ) {
            return res.status(400).json({
                success: false,
                message: "Page must be positive and limit must be between 1 and 50.",
            });
        }

        const skip = (parsedPage - 1) * parsedLimit;

        const [products, totalProducts] = await Promise.all([
            Product.find(filter)
                .populate("farmer", "name")
                .sort(sortOptions[sort])
                .skip(skip)
                .limit(parsedLimit)
                .lean(),

            Product.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            count: products.length,
            totalProducts,
            page: parsedPage,
            limit: parsedLimit,
            totalPages: Math.ceil(totalProducts / parsedLimit),
            products,
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/products/my-products
export async function getMyProducts(req, res, next) {
    try {
        const products = await Product.find({
            farmer: req.user._id,
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: products.length,
            products,
        });
    } catch (error) {
        next(error);
    }
}

// PATCH /api/products/:id
export async function updateProduct(req, res, next) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID.",
            });
        }

        const result = updateProductSchema.safeParse(req.body);

        if (!result.success) {
            return sendValidationError(
                res,
                result,
                "Please check your product update details."
            );
        }

        const product = await Product.findOneAndUpdate(
            {
                _id: req.params.id,
                farmer: req.user._id,
            },
            { $set: result.data },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found or you do not own this product.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product updated successfully.",
            product,
        });
    } catch (error) {
        next(error);
    }
}

// DELETE /api/products/:id
export async function deleteProduct(req, res, next) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID.",
            });
        }

        const product = await Product.findOneAndDelete({
            _id: req.params.id,
            farmer: req.user._id,
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found or you do not own this product.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully.",
        });
    } catch (error) {
        next(error);
    }
}
