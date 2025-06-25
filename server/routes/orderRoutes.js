const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Order = require("../models/Order");
const Coupon = require("../models/Coupon");
const CartItem = require("../models/Cart");
const { authenticateToken } = require("../middleware/auth");
const { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } = require("../services/emailService");
const paypalConfig = require("../config/paypal");

// Apply authentication middleware to all order routes
router.use(authenticateToken);

// POST /api/orders/create - Create new order
router.post("/create", async (req, res) => {
    try {
        const {
            customerInfo,
            shippingAddress,
            products,
            pricing,
            paymentMethod,
            couponCode,
            isDirectPurchase = false
        } = req.body;

        console.log("📦 Creating new order for user:", req.user._id);
        console.log("🛒 Order data:", { customerInfo, shippingAddress, products, pricing, paymentMethod });

        // Validate required fields
        if (!customerInfo || !shippingAddress || !products || !pricing || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: "Missing required order information"
            });
        }

        // Validate products array
        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one product is required"
            });
        }

        // Apply coupon if provided
        let finalPricing = { ...pricing };
        if (couponCode) {
            try {
                const coupon = await Coupon.findOne({
                    code: couponCode.toUpperCase(),
                    isActive: true
                });

                if (coupon && coupon.isValid() && coupon.canUserUse(req.user._id)) {
                    const discount = coupon.calculateDiscount(pricing.subtotal);
                    finalPricing.discount = discount;
                    finalPricing.couponCode = couponCode.toUpperCase();
                    finalPricing.totalAmount = pricing.subtotal + pricing.shipping + pricing.tax - discount;
                    console.log(`🎫 Applied coupon ${couponCode}: ₹${discount} discount`);
                } else {
                    console.log(`❌ Invalid coupon: ${couponCode}`);
                }
            } catch (couponError) {
                console.error("❌ Error applying coupon:", couponError);
                // Continue without coupon if there's an error
            }
        }

        // Create order object
        const orderData = {
            userId: req.user._id,
            customerInfo,
            shippingAddress,
            products,
            pricing: finalPricing,
            payment: {
                method: paymentMethod,
                status: paymentMethod === "cod" ? "pending" : "pending"
            },
            status: "pending"
        };

        // Handle different payment methods
        if (paymentMethod === "paypal") {
            // PayPal payment processing
            if (!paypalConfig) {
                return res.status(400).json({
                    success: false,
                    message: "PayPal payment gateway not configured. Please use Cash on Delivery."
                });
            }

            try {
                const paypalOrder = {
                    intent: 'CAPTURE',
                    purchase_units: [{
                        amount: {
                            currency_code: 'USD',
                            value: (finalPricing.totalAmount / 80).toFixed(2) // Convert INR to USD (approximate)
                        },
                        description: `IntelliBazar Order - ${products.length} item(s)`,
                        custom_id: req.user._id.toString(),
                        invoice_id: `order_${Date.now()}`
                    }],
                    application_context: {
                        return_url: `${process.env.CLIENT_URL}/checkout/success`,
                        cancel_url: `${process.env.CLIENT_URL}/checkout/cancel`,
                        brand_name: 'IntelliBazar',
                        landing_page: 'BILLING',
                        user_action: 'PAY_NOW'
                    }
                };

                orderData.payment.paypalOrderData = paypalOrder;
                orderData.payment.method = "paypal";
                console.log("✅ PayPal order data prepared");
            } catch (paypalError) {
                console.error("❌ Error preparing PayPal order:", paypalError);
                return res.status(500).json({
                    success: false,
                    message: "Error creating payment order. Please try again or use Cash on Delivery."
                });
            }
        }

        // Create order in database
        const order = new Order(orderData);
        await order.save();

        console.log("✅ Order created successfully:", order._id);

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: {
                orderId: order._id,
                orderNumber: order.tracking.orderNumber,
                paymentMethod: order.payment.method,
                amount: finalPricing.totalAmount,
                currency: "INR",

                // PayPal specific data
                paypalOrderData: order.payment.paypalOrderData
            }
        });

    } catch (error) {
        console.error("❌ Error creating order:", error);
        res.status(500).json({
            success: false,
            message: "Error creating order",
            error: error.message
        });
    }
});

// POST /api/orders/verify-payment - Verify payment (PayPal/UPI)
router.post("/verify-payment", async (req, res) => {
    try {
        const { orderId, paymentMethod } = req.body;

        console.log(`💳 Verifying ${paymentMethod || 'payment'} for order:`, orderId);

        // Find order
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        let paymentVerified = false;

        if (order.payment.method === "paypal") {
            // PayPal payment verification
            const { paypalOrderId, paypalPaymentId, payerInfo } = req.body;

            console.log("PayPal payment details:", { paypalOrderId, paypalPaymentId, payerInfo });

            // Update order with PayPal payment details
            order.payment.paypalOrderId = paypalOrderId;
            order.payment.paypalPaymentId = paypalPaymentId;
            order.payment.transactionId = paypalPaymentId;
            paymentVerified = true;
        }

        if (!paymentVerified) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed"
            });
        }

        // Update order status
        order.payment.status = "completed";
        order.payment.paidAt = new Date();
        order.status = "confirmed";

        // Update coupon usage if coupon was used
        if (order.pricing.couponCode) {
            const coupon = await Coupon.findOne({ code: order.pricing.couponCode });
            if (coupon) {
                coupon.usageCount += 1;
                coupon.usedBy.push({
                    userId: order.userId,
                    orderAmount: order.pricing.subtotal,
                    discountAmount: order.pricing.discount
                });
                await coupon.save();
            }
        }

        await order.save();

        // Send order confirmation email
        try {
            await sendOrderConfirmationEmail(order);
        } catch (emailError) {
            console.error("❌ Error sending confirmation email:", emailError);
            // Don't fail the order if email fails
        }

        console.log("✅ Payment verified successfully for order:", orderId);

        res.json({
            success: true,
            message: "Payment verified successfully",
            data: {
                orderId: order._id,
                orderNumber: order.tracking.orderNumber,
                status: order.status
            }
        });

    } catch (error) {
        console.error("❌ Error verifying payment:", error);
        res.status(500).json({
            success: false,
            message: "Error verifying payment",
            error: error.message
        });
    }
});


// POST /api/orders/complete - Complete order (for COD and other methods)
router.post("/complete", async (req, res) => {
    try {
        const { orderId, clearCart = false } = req.body;

        console.log("🎉 Completing order:", orderId);

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Update order status
        if (order.payment.method === "cod") {
            order.status = "confirmed";
        }

        // Update coupon usage if coupon was used
        if (order.pricing.couponCode) {
            const coupon = await Coupon.findOne({ code: order.pricing.couponCode });
            if (coupon) {
                coupon.usageCount += 1;
                coupon.usedBy.push({
                    userId: order.userId,
                    orderAmount: order.pricing.subtotal,
                    discountAmount: order.pricing.discount
                });
                await coupon.save();
            }
        }

        await order.save();

        // Send order confirmation email for COD orders
        if (order.payment.method === "cod") {
            try {
                await sendOrderConfirmationEmail(order);
            } catch (emailError) {
                console.error("❌ Error sending confirmation email:", emailError);
                // Don't fail the order if email fails
            }
        }

        // Clear cart if requested (for cart checkout)
        if (clearCart) {
            await CartItem.deleteMany({ user: req.user._id });
            console.log("🗑️ Cart cleared for user:", req.user._id);
        }

        console.log("✅ Order completed successfully:", orderId);

        res.json({
            success: true,
            message: "Order completed successfully",
            data: {
                orderId: order._id,
                orderNumber: order.tracking.orderNumber,
                status: order.status
            }
        });

    } catch (error) {
        console.error("❌ Error completing order:", error);
        res.status(500).json({
            success: false,
            message: "Error completing order",
            error: error.message
        });
    }
});

// GET /api/orders - Get user's order history
router.get("/", async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const skip = (page - 1) * limit;

        let query = { userId: req.user._id };
        if (status) {
            query.status = status;
        }

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Order.countDocuments(query);

        res.json({
            success: true,
            data: orders,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalOrders: total,
                hasNext: skip + orders.length < total,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error("❌ Error fetching orders:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching orders",
            error: error.message
        });
    }
});

// GET /api/orders/:id - Get specific order details
router.get("/:id", async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.json({
            success: true,
            data: order
        });

    } catch (error) {
        console.error("❌ Error fetching order:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching order",
            error: error.message
        });
    }
});

// POST /api/orders/validate-coupon - Validate coupon code
router.post("/validate-coupon", async (req, res) => {
    try {
        const { couponCode, orderAmount } = req.body;

        if (!couponCode || !orderAmount) {
            return res.status(400).json({
                success: false,
                message: "Coupon code and order amount are required"
            });
        }

        const coupon = await Coupon.findOne({
            code: couponCode.toUpperCase(),
            isActive: true
        });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Invalid coupon code"
            });
        }

        if (!coupon.isValid()) {
            return res.status(400).json({
                success: false,
                message: "Coupon has expired or is no longer valid"
            });
        }

        if (!coupon.canUserUse(req.user._id)) {
            return res.status(400).json({
                success: false,
                message: "You have already used this coupon"
            });
        }

        if (orderAmount < coupon.minOrderAmount) {
            return res.status(400).json({
                success: false,
                message: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`
            });
        }

        const discount = coupon.calculateDiscount(orderAmount);

        res.json({
            success: true,
            message: "Coupon is valid",
            data: {
                couponCode: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                discount: discount,
                description: coupon.description
            }
        });

    } catch (error) {
        console.error("❌ Error validating coupon:", error);
        res.status(500).json({
            success: false,
            message: "Error validating coupon",
            error: error.message
        });
    }
});

// GET /api/orders/coupons/available - Get available coupons for user
router.get("/coupons/available", async (req, res) => {
    try {
        console.log("🎫 Fetching available coupons for user:", req.user._id);

        const now = new Date();

        const coupons = await Coupon.find({
            isActive: true,
            validFrom: { $lte: now },
            validUntil: { $gte: now },
            $or: [
                { usageLimit: null },
                { $expr: { $lt: ["$usageCount", "$usageLimit"] } }
            ]
        }).select("code name description discountType discountValue maxDiscount minOrderAmount validUntil");

        console.log(`📋 Found ${coupons.length} active coupons`);

        // Filter coupons user can still use
        const availableCoupons = [];
        for (const coupon of coupons) {
            try {
                if (coupon.canUserUse(req.user._id)) {
                    availableCoupons.push(coupon);
                }
            } catch (err) {
                console.error("Error checking coupon usage for coupon:", coupon.code, err);
            }
        }

        console.log(`✅ ${availableCoupons.length} coupons available for user`);

        res.json({
            success: true,
            data: availableCoupons
        });

    } catch (error) {
        console.error("❌ Error fetching available coupons:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching available coupons",
            error: error.message
        });
    }
});

// Admin Routes (require admin authentication)
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: "Admin access required"
        });
    }
    next();
};

// GET /api/orders/admin/all - Get all orders (admin only)
router.get("/admin/all", requireAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 20, status, search } = req.query;
        const skip = (page - 1) * limit;

        let query = {};
        if (status && status !== 'all') {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { "tracking.orderNumber": { $regex: search, $options: 'i' } },
                { "customerInfo.firstName": { $regex: search, $options: 'i' } },
                { "customerInfo.lastName": { $regex: search, $options: 'i' } },
                { "customerInfo.email": { $regex: search, $options: 'i' } }
            ];
        }

        const orders = await Order.find(query)
            .populate("userId", "username email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Order.countDocuments(query);

        res.json({
            success: true,
            data: orders,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalOrders: total,
                hasNext: skip + orders.length < total,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error("❌ Error fetching admin orders:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching orders",
            error: error.message
        });
    }
});

// PUT /api/orders/admin/:id/status - Update order status (admin only)
router.put("/admin/:id/status", requireAdmin, async (req, res) => {
    try {
        const { status, notes } = req.body;

        const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status"
            });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        const oldStatus = order.status;
        order.status = status;
        if (notes) {
            order.adminNotes = notes;
        }

        // Auto-set estimated delivery date based on status
        if (status === "shipped" && !order.tracking.estimatedDelivery) {
            const estimatedDelivery = new Date();
            estimatedDelivery.setDate(estimatedDelivery.getDate() + 5); // 5 days from shipping
            order.tracking.estimatedDelivery = estimatedDelivery;
        }

        await order.save();

        // Send status update email if status changed
        if (oldStatus !== status) {
            try {
                await sendOrderStatusUpdateEmail(order, status);
            } catch (emailError) {
                console.error("❌ Error sending status update email:", emailError);
                // Don't fail the status update if email fails
            }
        }

        console.log(`✅ Order ${order.tracking.orderNumber} status updated from ${oldStatus} to ${status}`);

        res.json({
            success: true,
            message: "Order status updated successfully",
            data: {
                orderId: order._id,
                orderNumber: order.tracking.orderNumber,
                oldStatus,
                newStatus: status,
                estimatedDelivery: order.tracking.estimatedDelivery
            }
        });

    } catch (error) {
        console.error("❌ Error updating order status:", error);
        res.status(500).json({
            success: false,
            message: "Error updating order status",
            error: error.message
        });
    }
});

// PUT /api/orders/admin/:id/tracking - Update order tracking information (admin only)
router.put("/admin/:id/tracking", requireAdmin, async (req, res) => {
    try {
        const { trackingNumber, carrier, estimatedDelivery } = req.body;

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Update tracking information
        if (trackingNumber) {
            order.tracking.trackingNumber = trackingNumber;
        }
        if (carrier) {
            order.tracking.carrier = carrier;
        }
        if (estimatedDelivery) {
            order.tracking.estimatedDelivery = new Date(estimatedDelivery);
        }

        await order.save();

        console.log(`✅ Order ${order.tracking.orderNumber} tracking updated`);

        res.json({
            success: true,
            message: "Order tracking updated successfully",
            data: {
                orderId: order._id,
                orderNumber: order.tracking.orderNumber,
                tracking: order.tracking
            }
        });

    } catch (error) {
        console.error("❌ Error updating order tracking:", error);
        res.status(500).json({
            success: false,
            message: "Error updating order tracking",
            error: error.message
        });
    }
});

// GET /api/orders/track/:orderNumber - Track order by order number (public)
router.get("/track/:orderNumber", async (req, res) => {
    try {
        const orderNumber = req.params.orderNumber;

        console.log("📦 Tracking order:", orderNumber);

        const order = await Order.findOne({
            "tracking.orderNumber": orderNumber
        }).select("tracking status customerInfo.firstName customerInfo.lastName products pricing createdAt");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Create tracking timeline
        const timeline = [
            {
                status: "pending",
                title: "Order Placed",
                description: "Your order has been placed successfully",
                completed: true,
                date: order.createdAt
            },
            {
                status: "confirmed",
                title: "Order Confirmed",
                description: "Your order has been confirmed and is being prepared",
                completed: ["confirmed", "processing", "shipped", "delivered"].includes(order.status),
                date: order.status === "confirmed" ? order.updatedAt : null
            },
            {
                status: "processing",
                title: "Processing",
                description: "Your order is being processed and packed",
                completed: ["processing", "shipped", "delivered"].includes(order.status),
                date: order.status === "processing" ? order.updatedAt : null
            },
            {
                status: "shipped",
                title: "Shipped",
                description: "Your order has been shipped",
                completed: ["shipped", "delivered"].includes(order.status),
                date: order.status === "shipped" ? order.updatedAt : null
            },
            {
                status: "delivered",
                title: "Delivered",
                description: "Your order has been delivered",
                completed: order.status === "delivered",
                date: order.status === "delivered" ? order.updatedAt : null
            }
        ];

        res.json({
            success: true,
            data: {
                orderNumber: order.tracking.orderNumber,
                status: order.status,
                customerName: `${order.customerInfo.firstName} ${order.customerInfo.lastName}`,
                tracking: order.tracking,
                timeline,
                products: order.products,
                totalAmount: order.pricing.totalAmount,
                orderDate: order.createdAt
            }
        });

    } catch (error) {
        console.error("❌ Error tracking order:", error);
        res.status(500).json({
            success: false,
            message: "Error tracking order",
            error: error.message
        });
    }
});

// GET /api/orders/admin/stats - Get order statistics (admin only)
router.get("/admin/stats", requireAdmin, async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: "pending" });
        const confirmedOrders = await Order.countDocuments({ status: "confirmed" });
        const processingOrders = await Order.countDocuments({ status: "processing" });
        const shippedOrders = await Order.countDocuments({ status: "shipped" });
        const deliveredOrders = await Order.countDocuments({ status: "delivered" });
        const cancelledOrders = await Order.countDocuments({ status: "cancelled" });

        // Calculate total revenue
        const revenueResult = await Order.aggregate([
            { $match: { status: { $in: ["delivered", "confirmed", "processing", "shipped"] } } },
            { $group: { _id: null, totalRevenue: { $sum: "$pricing.totalAmount" } } }
        ]);
        const totalRevenue = revenueResult[0]?.totalRevenue || 0;

        // Get recent orders
        const recentOrders = await Order.find()
            .populate("userId", "username email")
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            data: {
                totalOrders,
                ordersByStatus: {
                    pending: pendingOrders,
                    confirmed: confirmedOrders,
                    processing: processingOrders,
                    shipped: shippedOrders,
                    delivered: deliveredOrders,
                    cancelled: cancelledOrders
                },
                totalRevenue,
                recentOrders
            }
        });

    } catch (error) {
        console.error("❌ Error fetching order stats:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching order statistics",
            error: error.message
        });
    }
});

module.exports = router;
