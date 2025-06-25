const express = require("express");
const router = express.Router();
const WishlistItem = require("../models/Wishlist");
const { authenticateToken } = require("../middleware/auth");

// Apply authentication middleware to all wishlist routes
router.use(authenticateToken);

// GET /api/wishlist - Get user's wishlist items
router.get("/", async (req, res) => {
  try {
    const wishlistItems = await WishlistItem.find({ user: req.user._id }).sort({ addedAt: -1 });
    
    res.json({
      success: true,
      data: wishlistItems,
      count: wishlistItems.length
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching wishlist items"
    });
  }
});

// POST /api/wishlist - Add item to wishlist
router.post("/", async (req, res) => {
  try {
    const { productName, productPrice, productImage, productCategory, productRating } = req.body;

    // Validate required fields
    if (!productName || !productPrice || !productImage || !productCategory) {
      return res.status(400).json({
        success: false,
        message: "Missing required product information"
      });
    }

    // Check if item already exists in wishlist
    const existingItem = await WishlistItem.findOne({
      user: req.user._id,
      productName: productName
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: "Item already in wishlist"
      });
    }

    // Create new wishlist item
    const newWishlistItem = new WishlistItem({
      user: req.user._id,
      productName,
      productPrice,
      productImage,
      productCategory,
      productRating: productRating || 0
    });

    await newWishlistItem.save();

    res.status(201).json({
      success: true,
      message: "Item added to wishlist",
      data: newWishlistItem
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Error adding item to wishlist"
    });
  }
});

// DELETE /api/wishlist/:id - Remove specific item from wishlist
router.delete("/:id", async (req, res) => {
  try {
    const wishlistItem = await WishlistItem.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        message: "Wishlist item not found"
      });
    }

    res.json({
      success: true,
      message: "Item removed from wishlist"
    });
  } catch (error) {
    console.error("Error removing wishlist item:", error);
    res.status(500).json({
      success: false,
      message: "Error removing wishlist item"
    });
  }
});

// DELETE /api/wishlist/product/:productName - Remove item by product name
router.delete("/product/:productName", async (req, res) => {
  try {
    const wishlistItem = await WishlistItem.findOneAndDelete({
      user: req.user._id,
      productName: req.params.productName
    });

    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        message: "Wishlist item not found"
      });
    }

    res.json({
      success: true,
      message: "Item removed from wishlist"
    });
  } catch (error) {
    console.error("Error removing wishlist item:", error);
    res.status(500).json({
      success: false,
      message: "Error removing wishlist item"
    });
  }
});

// DELETE /api/wishlist - Clear entire wishlist
router.delete("/", async (req, res) => {
  try {
    await WishlistItem.deleteMany({ user: req.user._id });

    res.json({
      success: true,
      message: "Wishlist cleared successfully"
    });
  } catch (error) {
    console.error("Error clearing wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Error clearing wishlist"
    });
  }
});

// POST /api/wishlist/move-all-to-cart - Move all wishlist items to cart
router.post("/move-all-to-cart", async (req, res) => {
  try {
    const CartItem = require("../models/Cart");

    // Get all wishlist items for the user
    const wishlistItems = await WishlistItem.find({ user: req.user._id });

    if (wishlistItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No items in wishlist to move"
      });
    }

    let successCount = 0;
    let failedItems = [];

    // Process each wishlist item
    for (const wishlistItem of wishlistItems) {
      try {
        // Check if item already exists in cart
        const existingCartItem = await CartItem.findOne({
          user: req.user._id,
          productName: wishlistItem.productName
        });

        if (existingCartItem) {
          // Update quantity if item already in cart
          existingCartItem.quantity += 1;
          await existingCartItem.save();
        } else {
          // Create new cart item
          const newCartItem = new CartItem({
            user: req.user._id,
            productName: wishlistItem.productName,
            productPrice: wishlistItem.productPrice,
            productImage: wishlistItem.productImage,
            productCategory: wishlistItem.productCategory,
            productRating: wishlistItem.productRating,
            quantity: 1
          });
          await newCartItem.save();
        }

        // Remove from wishlist after successful cart addition
        await WishlistItem.findByIdAndDelete(wishlistItem._id);
        successCount++;

      } catch (itemError) {
        console.error(`Error processing wishlist item ${wishlistItem.productName}:`, itemError);
        failedItems.push(wishlistItem.productName);
      }
    }

    // Return results
    if (successCount > 0 && failedItems.length === 0) {
      res.json({
        success: true,
        message: `All ${successCount} items moved to cart successfully`,
        data: {
          successCount,
          failedCount: 0,
          failedItems: []
        }
      });
    } else if (successCount > 0 && failedItems.length > 0) {
      res.json({
        success: true,
        message: `${successCount} items moved to cart. ${failedItems.length} items failed to move.`,
        data: {
          successCount,
          failedCount: failedItems.length,
          failedItems
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to move items to cart",
        data: {
          successCount: 0,
          failedCount: failedItems.length,
          failedItems
        }
      });
    }

  } catch (error) {
    console.error("Error moving all items to cart:", error);
    res.status(500).json({
      success: false,
      message: "Error moving items to cart"
    });
  }
});

module.exports = router;
