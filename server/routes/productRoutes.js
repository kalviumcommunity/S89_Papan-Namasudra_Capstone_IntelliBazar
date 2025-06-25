const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const Product = require("../models/Product");
const { authenticateToken } = require("../middleware/auth");
const router = express.Router();

// Configure Cloudinary (ensure environment variables are set)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage for product images
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "intellibazar/products",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [
            { width: 800, height: 800, crop: "limit", quality: "auto" },
        ],
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed!"), false);
        }
    },
});

// Admin/Seller role checking middleware
const requireSellerOrAdmin = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'seller') {
        return res.status(403).json({
            success: false,
            message: "Seller or admin access required"
        });
    }
    next();
};

// GET /api/products - Get All Products (Public)
router.get("/", async (req, res) => {
    try {
        const {
            category,
            search,
            minPrice,
            maxPrice,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            page = 1,
            limit = 20,
            isActive = true
        } = req.query;

        // Build query
        let query = { isActive: isActive !== 'false' }; // Default to true unless explicitly set to false

        if (category && category !== 'all') {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } },
                { searchKeywords: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const products = await Product.find(query)
            .populate('sellerId', 'username email')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            message: "Products retrieved successfully",
            data: {
                products,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalProducts: total,
                    hasNext: page * limit < total,
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        console.error("Error retrieving products:", error);
        res.status(500).json({
            success: false,
            message: "Error retrieving products",
            error: error.message
        });
    }
});

// GET /api/products/seller - Get Products by Seller (Authenticated)
router.get("/seller", authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

        const skip = (page - 1) * limit;
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const products = await Product.find({ sellerId: req.user.id })
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Product.countDocuments({ sellerId: req.user.id });

        res.status(200).json({
            success: true,
            message: "Seller products retrieved successfully",
            data: {
                products,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalProducts: total,
                    hasNext: page * limit < total,
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        console.error("Error retrieving seller products:", error);
        res.status(500).json({
            success: false,
            message: "Error retrieving seller products",
            error: error.message
        });
    }
});

// GET /api/products/:id - Get Single Product (Public)
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('sellerId', 'username email');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Increment view count
        await Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

        res.status(200).json({
            success: true,
            message: "Product retrieved successfully",
            data: product
        });
    } catch (error) {
        console.error("Error retrieving product:", error);
        res.status(500).json({
            success: false,
            message: "Error retrieving product",
            error: error.message
        });
    }
});

// POST /api/products - Add New Product (Authenticated Seller/Admin)
router.post("/", authenticateToken, requireSellerOrAdmin, upload.array('images', 5), async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            category,
            stock,
            specifications,
            tags,
            originalPrice,
            discountPercentage
        } = req.body;

        // Validate required fields
        if (!name || !description || !price || !category) {
            return res.status(400).json({
                success: false,
                message: "Name, description, price, and category are required"
            });
        }

        // Validate category
        const validCategories = ['electronics', 'fashion', 'watches', 'footwear', 'home-decor', 'books', 'kitchen', 'sports'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category. Must be one of: " + validCategories.join(', ')
            });
        }

        // Process uploaded images
        let images = [];
        let primaryImage = "";

        if (req.files && req.files.length > 0) {
            images = req.files.map(file => ({
                url: file.path,
                publicId: file.filename,
                alt: `${name} image`
            }));
            primaryImage = req.files[0].path; // First image as primary
        } else {
            return res.status(400).json({
                success: false,
                message: "At least one product image is required"
            });
        }

        // Parse specifications if provided
        let parsedSpecifications = {};
        if (specifications) {
            try {
                parsedSpecifications = typeof specifications === 'string'
                    ? JSON.parse(specifications)
                    : specifications;
            } catch (error) {
                console.error("Error parsing specifications:", error);
            }
        }

        // Parse tags if provided
        let parsedTags = [];
        if (tags) {
            parsedTags = typeof tags === 'string'
                ? tags.split(',').map(tag => tag.trim())
                : tags;
        }

        // Create product
        const productData = {
            name: name.trim(),
            description: description.trim(),
            price: Number(price),
            category,
            stock: Number(stock) || 0,
            sellerId: req.user.id,
            sellerName: req.user.username || req.user.email,
            sellerType: req.user.isAdmin ? 'admin' : 'user',
            images,
            primaryImage,
            specifications: parsedSpecifications,
            tags: parsedTags,
            originalPrice: originalPrice ? Number(originalPrice) : Number(price),
            discountPercentage: Number(discountPercentage) || 0
        };

        const product = new Product(productData);
        await product.save();

        res.status(201).json({
            success: true,
            message: "Product added successfully",
            data: product
        });
    } catch (error) {
        console.error("Error adding product:", error);

        // Clean up uploaded images if product creation fails
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                cloudinary.uploader.destroy(file.filename).catch(err =>
                    console.error("Error deleting image:", err)
                );
            });
        }

        res.status(500).json({
            success: false,
            message: "Error adding product",
            error: error.message
        });
    }
});

// PUT /api/products/:id - Update Product (Authenticated Seller/Admin)
router.put("/:id", authenticateToken, requireSellerOrAdmin, upload.array('images', 5), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Check if user owns the product or is admin
        if (product.sellerId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this product"
            });
        }

        const {
            name,
            description,
            price,
            category,
            stock,
            specifications,
            tags,
            originalPrice,
            discountPercentage,
            isActive
        } = req.body;

        // Update basic fields
        if (name) product.name = name.trim();
        if (description) product.description = description.trim();
        if (price) product.price = Number(price);
        if (category) {
            const validCategories = ['electronics', 'fashion', 'watches', 'footwear', 'home-decor', 'books', 'kitchen', 'sports'];
            if (!validCategories.includes(category)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category"
                });
            }
            product.category = category;
        }
        if (stock !== undefined) product.stock = Number(stock);
        if (originalPrice) product.originalPrice = Number(originalPrice);
        if (discountPercentage !== undefined) product.discountPercentage = Number(discountPercentage);
        if (isActive !== undefined) product.isActive = Boolean(isActive);

        // Update specifications
        if (specifications) {
            try {
                const parsedSpecs = typeof specifications === 'string'
                    ? JSON.parse(specifications)
                    : specifications;
                product.specifications = { ...product.specifications, ...parsedSpecs };
            } catch (error) {
                console.error("Error parsing specifications:", error);
            }
        }

        // Update tags
        if (tags) {
            const parsedTags = typeof tags === 'string'
                ? tags.split(',').map(tag => tag.trim())
                : tags;
            product.tags = parsedTags;
        }

        // Handle new images
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => ({
                url: file.path,
                publicId: file.filename,
                alt: `${product.name} image`
            }));

            // Add new images to existing ones
            product.images.push(...newImages);

            // Update primary image if it's the first upload
            if (!product.primaryImage) {
                product.primaryImage = newImages[0].url;
            }
        }

        await product.save();

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product
        });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({
            success: false,
            message: "Error updating product",
            error: error.message
        });
    }
});

// DELETE /api/products/:id - Delete Product (Authenticated Seller/Admin)
router.delete("/:id", authenticateToken, requireSellerOrAdmin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Check if user owns the product or is admin
        if (product.sellerId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Not authorized to delete this product"
            });
        }

        // Delete images from Cloudinary
        if (product.images && product.images.length > 0) {
            const deletePromises = product.images.map(image => {
                if (image.publicId) {
                    return cloudinary.uploader.destroy(image.publicId);
                }
            }).filter(Boolean);

            await Promise.all(deletePromises);
        }

        await Product.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting product",
            error: error.message
        });
    }
});

// DELETE /api/products/:id/images/:imageId - Delete Specific Product Image
router.delete("/:id/images/:imageId", authenticateToken, requireSellerOrAdmin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Check if user owns the product or is admin
        if (product.sellerId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Not authorized to modify this product"
            });
        }

        const imageIndex = product.images.findIndex(img => img._id.toString() === req.params.imageId);

        if (imageIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Image not found"
            });
        }

        const imageToDelete = product.images[imageIndex];

        // Don't allow deletion if it's the only image
        if (product.images.length === 1) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete the only product image"
            });
        }

        // Delete from Cloudinary
        if (imageToDelete.publicId) {
            await cloudinary.uploader.destroy(imageToDelete.publicId);
        }

        // Remove from product
        product.images.splice(imageIndex, 1);

        // Update primary image if deleted image was primary
        if (product.primaryImage === imageToDelete.url) {
            product.primaryImage = product.images[0].url;
        }

        await product.save();

        res.status(200).json({
            success: true,
            message: "Image deleted successfully",
            data: product
        });
    } catch (error) {
        console.error("Error deleting image:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting image",
            error: error.message
        });
    }
});

// GET /api/products/categories/stats - Get Product Statistics by Category
router.get("/categories/stats", async (req, res) => {
    try {
        const stats = await Product.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 },
                    avgPrice: { $avg: "$price" },
                    minPrice: { $min: "$price" },
                    maxPrice: { $max: "$price" }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.status(200).json({
            success: true,
            message: "Category statistics retrieved successfully",
            data: stats
        });
    } catch (error) {
        console.error("Error retrieving category stats:", error);
        res.status(500).json({
            success: false,
            message: "Error retrieving category statistics",
            error: error.message
        });
    }
});

module.exports = router;