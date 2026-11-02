
import mongoose from "mongoose";
import Order from "../models/Order.js";

// GET: View orders containing products belonging to the logged-in farmer
export async function getFarmerOrders(req, res, next) {
    try {
        const orders = await Order.find({
            "items.farmer": req.user._id,
        })
            .populate("customer", "name email phone")
            .populate("items.product", "name imageUrl category")
            .sort({ createdAt: -1 })
            .lean();

        // Return only this farmer's items from each order.
        const farmerOrders = orders
            .map((order) => {
                const farmerItems = order.items.filter(
                    (item) =>
                        item.farmer &&
                        item.farmer.toString() === req.user._id.toString()
                );

                if (farmerItems.length === 0) return null;

                const farmerTotal = farmerItems.reduce(
                    (total, item) => total + item.price * item.quantity,
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

// PATCH: Update the status of one item belonging to this farmer
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

        const currentStatus = item.status;

        const allowedTransitions = {
            Pending: ["Confirmed"],
            Confirmed: ["Processing"],
            Processing: ["Shipped"],
            Shipped: ["Delivered"],
            Delivered: [],
            Cancelled: [],
        };

        if (!allowedTransitions[currentStatus]?.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot change status from ${currentStatus} to ${status}.`,
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
