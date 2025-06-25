const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Coupon = require("../models/Coupon");

dotenv.config();

const sampleCoupons = [
    {
        code: "WELCOME10",
        name: "Welcome Discount",
        description: "Get 10% off on your first order",
        discountType: "percentage",
        discountValue: 10,
        maxDiscount: 500,
        minOrderAmount: 500,
        usageLimit: 1000,
        userUsageLimit: 1,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isActive: true
    },
    {
        code: "SAVE50",
        name: "Flat ₹50 Off",
        description: "Get flat ₹50 off on orders above ₹1000",
        discountType: "fixed",
        discountValue: 50,
        minOrderAmount: 1000,
        usageLimit: 500,
        userUsageLimit: 3,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        isActive: true
    },
    {
        code: "BIGDEAL20",
        name: "Big Deal 20% Off",
        description: "Get 20% off on orders above ₹2000",
        discountType: "percentage",
        discountValue: 20,
        maxDiscount: 1000,
        minOrderAmount: 2000,
        usageLimit: 200,
        userUsageLimit: 1,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        isActive: true
    },
    {
        code: "FREESHIP",
        name: "Free Shipping",
        description: "Get free shipping on any order",
        discountType: "fixed",
        discountValue: 99, // Assuming shipping cost is ₹99
        minOrderAmount: 0,
        usageLimit: null, // Unlimited
        userUsageLimit: 5,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        isActive: true
    },
    {
        code: "STUDENT15",
        name: "Student Discount",
        description: "Special 15% discount for students",
        discountType: "percentage",
        discountValue: 15,
        maxDiscount: 750,
        minOrderAmount: 800,
        usageLimit: 300,
        userUsageLimit: 2,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        isActive: true
    }
];

async function addSampleCoupons() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // Clear existing coupons (optional)
        await Coupon.deleteMany({});
        console.log("🗑️ Cleared existing coupons");

        // Add sample coupons
        const createdCoupons = await Coupon.insertMany(sampleCoupons);
        console.log(`✅ Added ${createdCoupons.length} sample coupons:`);
        
        createdCoupons.forEach(coupon => {
            console.log(`   - ${coupon.code}: ${coupon.description}`);
        });

        console.log("\n🎉 Sample coupons added successfully!");
        
    } catch (error) {
        console.error("❌ Error adding sample coupons:", error);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB");
        process.exit(0);
    }
}

// Run the script
addSampleCoupons();
