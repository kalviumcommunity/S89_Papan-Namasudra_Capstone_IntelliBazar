const express = require("express");
const router = express.Router();
const CartItem = require("../models/Cart");
const { authenticateToken } = require("../middleware/auth");

// Apply authentication middleware to all cart routes
router.use(authenticateToken);

// GET /api/cart - Get user's cart items
router.get("/", async (req, res) => {
  try {
    console.log("📋 Cart API - Fetching cart items for user:", req.user._id);
    const cartItems = await CartItem.find({ user: req.user._id }).sort({ addedAt: -1 });

    console.log("📦 Cart API - Found cart items:", cartItems.length);
    console.log("📦 Cart API - Cart items data:", cartItems);

    res.json({
      success: true,
      data: cartItems,
      count: cartItems.length
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching cart items"
    });
  }
});

// POST /api/cart - Add item to cart
router.post("/", async (req, res) => {
  try {
    console.log("🛒 Cart API - Raw request body:", req.body);
    console.log("🛒 Cart API - Request headers:", req.headers);

    const { productName, productPrice, productImage, productCategory, productRating, quantity = 1 } = req.body;

    console.log("🛒 Cart API - Add to cart request:");
    console.log("👤 User:", req.user._id);
    console.log("📦 Product data:", { productName, productPrice, productImage, productCategory, productRating, quantity });
    console.log("🔍 Field validation:");
    console.log("  - productName:", productName, "exists:", !!productName);
    console.log("  - productPrice:", productPrice, "exists:", !!productPrice);
    console.log("  - productImage:", productImage, "exists:", !!productImage);
    console.log("  - productCategory:", productCategory, "exists:", !!productCategory);

    // Validate required fields
    if (!productName || !productPrice || !productImage || !productCategory) {
      console.log("❌ Cart API - Missing required fields");
      return res.status(400).json({
        success: false,
        message: "Missing required product information"
      });
    }

    // Check if item already exists in cart
    console.log("🔍 Cart API - Checking for existing item...");
    const existingItem = await CartItem.findOne({
      user: req.user._id,
      productName: productName
    });

    if (existingItem) {
      console.log("📦 Cart API - Item exists, updating quantity");
      // Update quantity if item exists
      existingItem.quantity += quantity;
      await existingItem.save();

      console.log("✅ Cart API - Item quantity updated:", existingItem);
      return res.json({
        success: true,
        message: "Cart item quantity updated",
        data: existingItem
      });
    }

    // Create new cart item
    console.log("➕ Cart API - Creating new cart item");
    const newCartItem = new CartItem({
      user: req.user._id,
      productName,
      productPrice,
      productImage,
      productCategory,
      productRating: productRating || 0,
      quantity
    });

    console.log("💾 Cart API - Saving new cart item:", newCartItem);
    await newCartItem.save();

    console.log("✅ Cart API - New cart item saved successfully:", newCartItem);
    res.status(201).json({
      success: true,
      message: "Item added to cart",
      data: newCartItem
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({
      success: false,
      message: "Error adding item to cart"
    });
  }
});

// PUT /api/cart/:id - Update cart item quantity
router.put("/:id", async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid quantity"
      });
    }

    const cartItem = await CartItem.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found"
      });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.json({
      success: true,
      message: "Cart item updated",
      data: cartItem
    });
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({
      success: false,
      message: "Error updating cart item"
    });
  }
});

// DELETE /api/cart/:id - Remove specific item from cart
router.delete("/:id", async (req, res) => {
  try {
    const cartItem = await CartItem.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found"
      });
    }

    res.json({
      success: true,
      message: "Item removed from cart"
    });
  } catch (error) {
    console.error("Error removing cart item:", error);
    res.status(500).json({
      success: false,
      message: "Error removing cart item"
    });
  }
});

// DELETE /api/cart - Clear entire cart
router.delete("/", async (req, res) => {
  try {
    await CartItem.deleteMany({ user: req.user._id });

    res.json({
      success: true,
      message: "Cart cleared successfully"
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({
      success: false,
      message: "Error clearing cart"
    });
  }
});

module.exports = router;
