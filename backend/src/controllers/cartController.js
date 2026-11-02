
import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// GET /api/cart
// View the logged-in customer's cart
export async function getCart(req, res, next) {
    try {
        let cart = await Cart.findOne({
            customer: req.user._id,
        })
            .populate({
                path: "items.product",
                select: "name category price unit quantity imageUrl farmer isActive",
                populate: {
                    path: "farmer",
                    select: "name address",
                },
            })
            .lean();

        if (!cart) {
            return res.status(200).json({
                success: true,
                message: "Your cart is empty.",
                cart: {
                    items: [],
                    totalItems: 0,
                    totalAmount: 0,
                },
            });
        }

        // Remove unavailable products from the displayed cart.
        const items = cart.items
            .filter(
                (item) =>
                    item.product &&
                    item.product.isActive &&
                    item.product.quantity > 0
            )
            .map((item) => {
                const currentPrice = item.product.price;

                return {
                    product: item.product,
                    quantity: item.quantity,
                    price: currentPrice,
                    lineTotal: currentPrice * item.quantity,
                    availableQuantity: item.product.quantity,
                };
            });

        const totalItems = items.reduce(
            (total, item) => total + item.quantity,
            0
        );

        const totalAmount = items.reduce(
            (total, item) => total + item.lineTotal,
            0
        );

        return res.status(200).json({
            success: true,
            cart: {
                items,
                totalItems,
                totalAmount,
            },
        });
    } catch (error) {
        next(error);
    }
}


// POST /api/cart/items
// Add a product to the customer's cart
export async function addToCart(req, res, next) {
    try {
        const { productId, quantity = 1 } = req.body;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID.",
            });
        }

        if (
            !Number.isSafeInteger(quantity) ||
            quantity < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive whole number.",
            });
        }

        const product = await Product.findOne({
            _id: productId,
            isActive: true,
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product is unavailable or does not exist.",
            });
        }

        if (product.farmer.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot add your own product to your cart.",
            });
        }

        if (product.quantity < quantity) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.quantity} units are currently available.`,
            });
        }

        let cart = await Cart.findOne({
            customer: req.user._id,
        });

        if (!cart) {
            cart = new Cart({
                customer: req.user._id,
                items: [],
            });
        }

        const existingItem = cart.items.find(
            (item) =>
                item.product.toString() === productId
        );

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;

            if (newQuantity > product.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${product.quantity} units are available.`,
                });
            }

            existingItem.quantity = newQuantity;
        } else {
            cart.items.push({
                product: productId,
                quantity,
            });
        }

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Product added to cart successfully.",
            cart,
        });
    } catch (error) {
        next(error);
    }
}


// PATCH /api/cart/items/:productId
// Update the quantity of a cart product
export async function updateCartItem(req, res, next) {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID.",
            });
        }

        if (
            !Number.isSafeInteger(quantity) ||
            quantity < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive whole number.",
            });
        }

        const product = await Product.findOne({
            _id: productId,
            isActive: true,
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product is no longer available.",
            });
        }

        if (quantity > product.quantity) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.quantity} units are available.`,
            });
        }

        const cart = await Cart.findOne({
            customer: req.user._id,
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found.",
            });
        }

        const item = cart.items.find(
            (item) =>
                item.product.toString() === productId
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Product not found in your cart.",
            });
        }

        item.quantity = quantity;

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Cart quantity updated successfully.",
            cart,
        });
    } catch (error) {
        next(error);
    }
}


// DELETE /api/cart/items/:productId
// Remove one product from the cart
export async function removeFromCart(req, res, next) {
    try {
        const { productId } = req.params;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID.",
            });
        }

        const cart = await Cart.findOne({
            customer: req.user._id,
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found.",
            });
        }

        const originalLength = cart.items.length;

        cart.items = cart.items.filter(
            (item) =>
                item.product.toString() !== productId
        );

        if (cart.items.length === originalLength) {
            return res.status(404).json({
                success: false,
                message: "Product not found in your cart.",
            });
        }

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from cart successfully.",
            cart,
        });
    } catch (error) {
        next(error);
    }
}


// DELETE /api/cart
// Clear the customer's entire cart
export async function clearCart(req, res, next) {
    try {
        const cart = await Cart.findOne({
            customer: req.user._id,
        });

        if (!cart) {
            return res.status(200).json({
                success: true,
                message: "Your cart is already empty.",
            });
        }

        cart.items = [];

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Cart cleared successfully.",
        });
    } catch (error) {
        next(error);
    }
}
