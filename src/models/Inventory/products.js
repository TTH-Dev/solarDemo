import mongoose from "mongoose";

const productSchema = new mongoose.Schema({

    productType: {
        type: String,
        required: true
    },
    material: {
        type: String,
        required: true
    },
    specification: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    unit: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    outOfStockThreshold: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        default: 0
    }
}, { timestamps: true });


const Product = mongoose.model("Product", productSchema);
export default Product;