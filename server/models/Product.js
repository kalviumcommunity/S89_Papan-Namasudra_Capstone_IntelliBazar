const mongoose = require("mongoose");


const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    stock: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});


productSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});


module.exports = mongoose.model("Product", productSchema);