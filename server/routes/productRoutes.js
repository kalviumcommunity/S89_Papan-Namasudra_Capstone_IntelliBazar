const express = require("express");
const Product = require("../models/Product");
const router = express.Router();

// Get All Products
router.get("/", async (req, res) => {
    try {
        const products = await Product.find(); 
        res.status(200).send({ message: "Products retrieved successfully", products });
    } catch (error) {
        console.error("Error retrieving products:", error);
        res.status(500).send({ message: "Error retrieving products", error });
    }
});

// Add a New Product
router.post("/", async (req, res) => {
    const { name, description, price, category, stock } = req.body;
    if (!name || !description || !price || !category) {
        return res.status(400).send({ message: "Name, description, price, and category are required" });
    }

    try {
        const product = new Product({ name, description, price, category, stock });
        await product.save();
        res.status(201).send({ message: "Product added successfully", product });
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).send({ message: "Error adding product", error });
    }
});

module.exports = router;