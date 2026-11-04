
import mongoose from "mongoose";
import { randomBytes } from "node:crypto";

import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// =====================================================
// CUSTOMER: Place a new Cash on Delivery order
// POST /api/orders
// =====================================================

export async function createOrder(req, res, next) {
    let session;

    try {
        const { shippingAddress } = req.body;

        // 1. Validate the shipping address
        const requiredFields = [
            "name",
            "phone",
            "village",
            "district",
            "state",
            "pincode",
        ];

        if (
            !shippingAddress ||
            typeof shippingAddress !== "object" ||
            Array.isArray(shippingAddress)
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid shipping address.",
            });
        }

        for (const field of requiredFields) {
            if (
                typeof shippingAddress[field] !== "string" ||
                !shippingAddress[field].trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message: `${field} is required.`,
                });
            }
        }

        const address = {
            name: shippingAddress.name.trim(),
            phone: shippingAddress.phone.trim(),
            village: shippingAddress.village.trim(),
            district: shippingAddress.district.trim(),
            state: shippingAddress.state.trim(),
            pincode: shippingAddress.pincode.trim(),
        };

        const phoneDigits = address.phone.replace(/\D/g, "");

        if (phoneDigits.length < 10 || phoneDigits.length > 15) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid phone number.",
            });
        }

        if (!/^[0-9]{4,10}$/.test(address.pincode)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid pincode.",
            });
        }

        // 2. Start a MongoDB transaction
        session = await mongoose.startSession();

        let placedOrder;

        await session.withTransaction(async () => {

            // 3. Find the logged-in customer's cart
            const cart = await Cart.findOne({
                customer: req.user._id,
            }).session(session);

            if (!cart || cart.items.length === 0) {
                const error = new Error("Your cart is empty.");
                error.statusCode = 400;
                throw error;
            }

            const orderItems = [];
            let totalAmount = 0;

            // 4. Validate every product and its stock
            for (const cartItem of cart.items) {

                const product = await Product.findById(
                    cartItem.product
                ).session(session);

                if (!product || !product.isActive) {
                    const error = new Error(
                        "One or more products in your cart are unavailable."
                    );
                    error.statusCode = 409;
                    throw error;
                }

                if (
                    product.farmer.toString() ===
                    req.user._id.toString()
                ) {
                    const error = new Error(
                        "You cannot purchase your own product."
                    );
                    error.statusCode = 400;
                    throw error;
                }

                if (product.quantity < cartItem.quantity) {
                    const error = new Error(
                        `Insufficient stock for ${product.name}. Available quantity: ${product.quantity}.`
                    );
                    error.statusCode = 409;
                    throw error;
                }

                // 5. Calculate the price using the database value
                const itemTotal =
                    product.price * cartItem.quantity;

                totalAmount += itemTotal;

                // Save product details as an order snapshot
                orderItems.push({
                    product: product._id,
                    farmer: product.farmer,
                    productName: product.name,
                    quantity: cartItem.quantity,
                    unit: product.unit,
                    price: product.price,
                    status: "Pending",
                });

                // 6. Reduce stock only if sufficient stock exists
                const updatedProduct =
                    await Product.findOneAndUpdate(
                        {
                            _id: product._id,
                            isActive: true,
                            quantity: {
                                $gte: cartItem.quantity,
                            },
                        },
                        {
                            $inc: {
                                quantity: -cartItem.quantity,
                            },
                        },
                        {
                            new: true,
                            session,
                        }
                    );

                if (!updatedProduct) {
                    const error = new Error(
                        `Stock changed while placing your order for ${product.name}. Please try again.`
                    );
                    error.statusCode = 409;
                    throw error;
                }
            }

            // 7. Round the total to two decimal places
            totalAmount = Number(totalAmount.toFixed(2));

            // 8. Generate a unique order number
            const orderNumber =
                `F2H-${Date.now()}-${randomBytes(3)
                    .toString("hex")
                    .toUpperCase()}`;

            // 9. Create the order
            const createdOrders = await Order.create(
                [
                    {
                        orderNumber,
                        customer: req.user._id,
                        items: orderItems,
                        totalAmount,
                        shippingAddress: address,
                        paymentMethod: "COD",
                        paymentStatus: "Pending",
                    },
                ],
                { session }
            );

            placedOrder = createdOrders[0];

            // 10. Clear the cart after successful order creation
            const deletedCart = await Cart.deleteOne(
                { _id: cart._id },
                { session }
            );

            if (deletedCart.deletedCount !== 1) {
                const error = new Error(
                    "Unable to clear the cart. Please try again."
                );
                error.statusCode = 409;
                throw error;
            }
        });

        // 11. Send the successful response
        return res.status(201).json({
            success: true,
            message: "Your order has been placed successfully.",
            order: {
                _id: placedOrder._id,
                orderNumber: placedOrder.orderNumber,
                totalAmount: placedOrder.totalAmount,
                paymentMethod: placedOrder.paymentMethod,
                paymentStatus: placedOrder.paymentStatus,
                shippingAddress: placedOrder.shippingAddress,
                items: placedOrder.items,
                createdAt: placedOrder.createdAt,
            },
        });

    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        }

        next(error);

    } finally {
        if (session) {
            await session.endSession();
        }
    }
}


// =====================================================
// FARMER: View orders containing their products
// GET /api/orders/farmer
// =====================================================

export async function getFarmerOrders(req, res, next) {
    try {
        const orders = await Order.find({
            "items.farmer": req.user._id,
        })
            .populate("customer", "name email phone")
            .populate("items.product", "name imageUrl category")
            .sort({ createdAt: -1 })
            .lean();

        const farmerOrders = orders
            .map((order) => {
                const farmerItems = order.items.filter(
                    (item) =>
                        item.farmer &&
                        item.farmer.toString() ===
                        req.user._id.toString()
                );

                if (farmerItems.length === 0) return null;

                const farmerTotal = farmerItems.reduce(
                    (total, item) =>
                        total + item.price * item.quantity,
                    0
                );

                return {
                    ...order,
                    items: farmerItems,
                    farmerTotal,
                };
            })
            .filter(Boolean);

        return res.status(200).json({
            success: true,
            count: farmerOrders.length,
            orders: farmerOrders,
        });

    } catch (error) {
        next(error);
    }
}


// =====================================================
// FARMER: Update the status of their own order item
// PATCH /api/orders/:orderId/items/:itemId/status
// =====================================================

export async function updateFarmerOrderStatus(req, res, next) {
    try {
        const { orderId, itemId } = req.params;
        const { status } = req.body;

        if (
            !mongoose.isValidObjectId(orderId) ||
            !mongoose.isValidObjectId(itemId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid order or item ID.",
            });
        }

        const allowedStatuses = [
            "Confirmed",
            "Processing",
            "Shipped",
            "Delivered",
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status.",
            });
        }

        const order = await Order.findOne({
            _id: orderId,
            items: {
                $elemMatch: {
                    _id: itemId,
                    farmer: req.user._id,
                },
            },
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order item not found for your account.",
            });
        }

        const item = order.items.id(itemId);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Order item not found.",
            });
        }

        const allowedTransitions = {
            Pending: ["Confirmed"],
            Confirmed: ["Processing"],
            Processing: ["Shipped"],
            Shipped: ["Delivered"],
            Delivered: [],
            Cancelled: [],
        };

        if (!allowedTransitions[item.status]?.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot change status from ${item.status} to ${status}.`,
            });
        }

        item.status = status;
        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully.",
            orderId: order._id,
            item: {
                _id: item._id,
                productName: item.productName,
                status: item.status,
            },
        });

    } catch (error) {
        next(error);
    }
}
