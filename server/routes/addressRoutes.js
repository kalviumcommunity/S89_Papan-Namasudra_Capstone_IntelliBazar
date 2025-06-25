const express = require("express");
const router = express.Router();
const Address = require("../models/Address");
const { authenticateToken } = require("../middleware/auth");

// Apply authentication middleware to all address routes
router.use(authenticateToken);

// GET /api/addresses - Get user's addresses
router.get("/", async (req, res) => {
  try {
    console.log("📍 Fetching addresses for user:", req.user._id);
    
    const addresses = await Address.find({ userId: req.user._id })
      .sort({ isDefault: -1, createdAt: -1 });

    console.log("📍 Found addresses:", addresses.length);

    res.json({
      success: true,
      data: addresses,
      count: addresses.length
    });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching addresses"
    });
  }
});

// GET /api/addresses/default - Get user's default address
router.get("/default", async (req, res) => {
  try {
    console.log("📍 Fetching default address for user:", req.user._id);
    
    const defaultAddress = await Address.findOne({ 
      userId: req.user._id, 
      isDefault: true 
    });

    if (!defaultAddress) {
      return res.status(404).json({
        success: false,
        message: "No default address found"
      });
    }

    console.log("📍 Found default address:", defaultAddress._id);

    res.json({
      success: true,
      data: defaultAddress
    });
  } catch (error) {
    console.error("Error fetching default address:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching default address"
    });
  }
});

// POST /api/addresses - Create new address
router.post("/", async (req, res) => {
  try {
    const {
      label,
      firstName,
      lastName,
      phone,
      address,
      city,
      state,
      pincode,
      country = "India",
      type = "home",
      isDefault = false
    } = req.body;

    console.log("📍 Creating new address for user:", req.user._id);
    console.log("📍 Address data:", { label, firstName, lastName, phone, address, city, state, pincode });

    // Validate required fields
    if (!label || !firstName || !lastName || !phone || !address || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: "All address fields are required"
      });
    }

    // Validate pincode format
    if (!/^[0-9]{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pincode format. Must be 6 digits."
      });
    }

    // Check if this is the first address for the user
    const existingAddressCount = await Address.countDocuments({ userId: req.user._id });
    const shouldBeDefault = existingAddressCount === 0 || isDefault;

    // Create new address
    const newAddress = new Address({
      userId: req.user._id,
      label,
      firstName,
      lastName,
      phone,
      address,
      city,
      state,
      pincode,
      country,
      type,
      isDefault: shouldBeDefault
    });

    await newAddress.save();

    console.log("✅ Address created successfully:", newAddress._id);

    res.status(201).json({
      success: true,
      message: "Address created successfully",
      data: newAddress
    });
  } catch (error) {
    console.error("Error creating address:", error);
    res.status(500).json({
      success: false,
      message: "Error creating address"
    });
  }
});

// PUT /api/addresses/:id - Update address
router.put("/:id", async (req, res) => {
  try {
    const addressId = req.params.id;
    const {
      label,
      firstName,
      lastName,
      phone,
      address,
      city,
      state,
      pincode,
      country,
      type,
      isDefault
    } = req.body;

    console.log("📍 Updating address:", addressId, "for user:", req.user._id);

    // Find and verify ownership
    const existingAddress = await Address.findOne({
      _id: addressId,
      userId: req.user._id
    });

    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found"
      });
    }

    // Validate required fields
    if (!label || !firstName || !lastName || !phone || !address || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: "All address fields are required"
      });
    }

    // Validate pincode format
    if (!/^[0-9]{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pincode format. Must be 6 digits."
      });
    }

    // Update address
    const updatedAddress = await Address.findByIdAndUpdate(
      addressId,
      {
        label,
        firstName,
        lastName,
        phone,
        address,
        city,
        state,
        pincode,
        country: country || "India",
        type: type || "home",
        isDefault: isDefault || false,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    console.log("✅ Address updated successfully:", updatedAddress._id);

    res.json({
      success: true,
      message: "Address updated successfully",
      data: updatedAddress
    });
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({
      success: false,
      message: "Error updating address"
    });
  }
});

// PUT /api/addresses/:id/default - Set address as default
router.put("/:id/default", async (req, res) => {
  try {
    const addressId = req.params.id;

    console.log("📍 Setting default address:", addressId, "for user:", req.user._id);

    // Find and verify ownership
    const address = await Address.findOne({
      _id: addressId,
      userId: req.user._id
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found"
      });
    }

    // Set as default (pre-save middleware will handle removing default from others)
    address.isDefault = true;
    await address.save();

    console.log("✅ Default address set successfully:", address._id);

    res.json({
      success: true,
      message: "Default address set successfully",
      data: address
    });
  } catch (error) {
    console.error("Error setting default address:", error);
    res.status(500).json({
      success: false,
      message: "Error setting default address"
    });
  }
});

// DELETE /api/addresses/:id - Delete address
router.delete("/:id", async (req, res) => {
  try {
    const addressId = req.params.id;

    console.log("📍 Deleting address:", addressId, "for user:", req.user._id);

    // Find and verify ownership
    const address = await Address.findOne({
      _id: addressId,
      userId: req.user._id
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found"
      });
    }

    // Check if this is the default address
    const wasDefault = address.isDefault;

    // Delete the address
    await Address.findByIdAndDelete(addressId);

    // If deleted address was default, set another address as default
    if (wasDefault) {
      const nextAddress = await Address.findOne({ userId: req.user._id });
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
        console.log("📍 Set new default address:", nextAddress._id);
      }
    }

    console.log("✅ Address deleted successfully:", addressId);

    res.json({
      success: true,
      message: "Address deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting address"
    });
  }
});

module.exports = router;
