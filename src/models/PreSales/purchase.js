import mongoose from "mongoose";

const groupedProductSchema = new mongoose.Schema({
    productType: {
        type: String,

    },
    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Products" },
            material: { type: String, },
            specification: { type: String },
            brand: { type: String },
            requiredQty: { type: Number, },
            requestQty: { type: Number, },
            purchasedStatus : { type: String },
            purchaseQty: { type: Number, },
            purchaseDate: { type: Date },
            unit: { type: String, default: "" },
            unitPrice: { type: Number, default: 0 },
            totalPrice: { type: Number, default: 0 },
            deliverDate: { type: String },
            deliveryIn: { type: String }
        }
    ]
});

const productPurchaseSchema = new mongoose.Schema({
    lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Leads",
    },
    groupedProducts: [groupedProductSchema],
    totalAmount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ["draft", "requested", "approved", "purchased"],
        default: "draft"
    },

}, { timestamps: true });

const Purchase = mongoose.model("Purchase", productPurchaseSchema);

export default Purchase;
