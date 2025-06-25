const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
    // Coupon Basic Information
    code: { 
        type: String, 
        required: true, 
        unique: true, 
        uppercase: true,
        trim: true,
        minlength: 3,
        maxlength: 20
    },
    
    name: { 
        type: String, 
        required: true,
        trim: true
    },
    
    description: { 
        type: String,
        trim: true
    },
    
    // Discount Configuration
    discountType: { 
        type: String, 
        enum: ["percentage", "fixed"], 
        required: true 
    },
    
    discountValue: { 
        type: Number, 
        required: true,
        min: 0
    },
    
    // Usage Limits
    maxDiscount: { 
        type: Number, 
        default: null // Maximum discount amount for percentage coupons
    },
    
    minOrderAmount: { 
        type: Number, 
        default: 0 // Minimum order amount to apply coupon
    },
    
    usageLimit: { 
        type: Number, 
        default: null // Total usage limit (null = unlimited)
    },
    
    usageCount: { 
        type: Number, 
        default: 0 // Current usage count
    },
    
    userUsageLimit: { 
        type: Number, 
        default: 1 // Per user usage limit
    },
    
    // Validity Period
    validFrom: { 
        type: Date, 
        required: true,
        default: Date.now
    },
    
    validUntil: { 
        type: Date, 
        required: true
    },
    
    // Applicable Categories/Products
    applicableCategories: [{ 
        type: String 
    }],
    
    applicableProducts: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Product" 
    }],
    
    // Status
    isActive: { 
        type: Boolean, 
        default: true 
    },
    
    // Tracking
    usedBy: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        usedAt: { type: Date, default: Date.now },
        orderAmount: { type: Number },
        discountAmount: { type: Number }
    }],
    
    // Metadata
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    },
    
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Update timestamp on save
couponSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

// Methods
couponSchema.methods.isValid = function() {
    const now = new Date();
    return this.isActive && 
           now >= this.validFrom && 
           now <= this.validUntil &&
           (this.usageLimit === null || this.usageCount < this.usageLimit);
};

couponSchema.methods.canUserUse = function(userId) {
    if (!userId) return false;

    const userUsage = this.usedBy.filter(usage =>
        usage.userId && usage.userId.toString() === userId.toString()
    ).length;

    return userUsage < this.userUsageLimit;
};

couponSchema.methods.calculateDiscount = function(orderAmount) {
    if (!this.isValid() || orderAmount < this.minOrderAmount) {
        return 0;
    }
    
    let discount = 0;
    
    if (this.discountType === "percentage") {
        discount = (orderAmount * this.discountValue) / 100;
        if (this.maxDiscount && discount > this.maxDiscount) {
            discount = this.maxDiscount;
        }
    } else if (this.discountType === "fixed") {
        discount = Math.min(this.discountValue, orderAmount);
    }
    
    return Math.round(discount);
};

// Indexes
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });
couponSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Coupon", couponSchema);
