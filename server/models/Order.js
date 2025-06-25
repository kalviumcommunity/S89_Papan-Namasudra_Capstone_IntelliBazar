const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    // User Information
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Customer Information
    customerInfo: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true }
    },

    // Shipping Address
    shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        country: { type: String, required: true, default: "India" }
    },

    // Products with detailed information
    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
            productName: { type: String, required: true },
            productPrice: { type: String, required: true },
            productImage: { type: String, required: true },
            productCategory: { type: String, required: true },
            productRating: { type: Number, default: 0 },
            quantity: { type: Number, required: true, min: 1 }
        }
    ],

    // Pricing Details
    pricing: {
        subtotal: { type: Number, required: true },
        shipping: { type: Number, default: 0 },
        tax: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        couponCode: { type: String },
        totalAmount: { type: Number, required: true }
    },

    // Payment Information
    payment: {
        method: {
            type: String,
            enum: ["card", "cod", "paypal"],
            required: true
        },
        status: { type: String, enum: ["pending", "completed", "failed", "refunded"], default: "pending" },

        // PayPal specific fields
        paypalOrderId: { type: String },
        paypalPaymentId: { type: String },
        paypalOrderData: { type: Object },

        // Generic fields
        transactionId: { type: String },
        paidAt: { type: Date }
    },

    // Order Status and Tracking
    status: {
        type: String,
        enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"],
        default: "pending"
    },

    // Order Tracking
    tracking: {
        orderNumber: { type: String, unique: true },
        estimatedDelivery: { type: Date },
        trackingNumber: { type: String },
        carrier: { type: String }
    },

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },

    // Additional Notes
    notes: { type: String },
    adminNotes: { type: String }
});

// Generate unique order number before saving
orderSchema.pre("save", function (next) {
    this.updatedAt = Date.now();

    // Generate order number if not exists
    if (!this.tracking.orderNumber) {
        const timestamp = Date.now().toString();
        this.tracking.orderNumber = `IB${timestamp.slice(-8)}`;
    }

    next();
});

// Index for faster queries
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ "tracking.orderNumber": 1 });
orderSchema.index({ "payment.razorpayOrderId": 1 });

module.exports = mongoose.model("Order", orderSchema);