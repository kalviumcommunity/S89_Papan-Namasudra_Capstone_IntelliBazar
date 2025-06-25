const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    // Basic Product Information
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: {
        type: String,
        required: true,
        enum: ['electronics', 'fashion', 'watches', 'footwear', 'home-decor', 'books', 'kitchen', 'sports']
    },
    stock: { type: Number, default: 0, min: 0 },

    // Seller Information
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
        // Note: Can reference either User or AdminUser collections
    },
    sellerName: { type: String, required: true },
    sellerType: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },

    // Product Images
    images: [{
        url: { type: String, required: true },
        publicId: { type: String }, // For Cloudinary
        alt: { type: String, default: "" }
    }],
    primaryImage: { type: String, required: true }, // Main product image URL

    // Product Details
    specifications: {
        brand: { type: String, default: "" },
        model: { type: String, default: "" },
        color: { type: String, default: "" },
        size: { type: String, default: "" },
        weight: { type: String, default: "" },
        dimensions: { type: String, default: "" },
        material: { type: String, default: "" },
        warranty: { type: String, default: "" },
        features: [{ type: String }]
    },

    // Product Status
    isActive: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: true }, // For admin approval if needed

    // SEO and Search
    tags: [{ type: String }],
    searchKeywords: [{ type: String }],

    // Pricing
    originalPrice: { type: Number }, // For discount calculations
    discountPercentage: { type: Number, default: 0, min: 0, max: 100 },

    // Product Metrics
    views: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    salesCount: { type: Number, default: 0 },

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Indexes for better query performance
productSchema.index({ sellerId: 1 });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ createdAt: -1 });

// Pre-save middleware
productSchema.pre("save", function (next) {
    this.updatedAt = Date.now();

    // Generate search keywords from name and description
    if (this.isModified('name') || this.isModified('description')) {
        const keywords = [];
        const nameWords = this.name.toLowerCase().split(/\s+/);
        const descWords = this.description.toLowerCase().split(/\s+/);
        keywords.push(...nameWords, ...descWords);
        this.searchKeywords = [...new Set(keywords)]; // Remove duplicates
    }

    next();
});

// Virtual for discounted price
productSchema.virtual('discountedPrice').get(function() {
    if (this.discountPercentage > 0) {
        return Math.round(this.price * (1 - this.discountPercentage / 100));
    }
    return this.price;
});

// Virtual for formatted price (for display)
productSchema.virtual('formattedPrice').get(function() {
    return `₹${this.price.toLocaleString('en-IN')}`;
});

// Virtual for formatted discounted price
productSchema.virtual('formattedDiscountedPrice').get(function() {
    return `₹${this.discountedPrice.toLocaleString('en-IN')}`;
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Product", productSchema);