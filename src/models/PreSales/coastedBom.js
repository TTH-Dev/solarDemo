

import mongoose from "mongoose";

const coastedBomSchema = new mongoose.Schema({

    siteName: {
        type: String,
        required: true
    },
    qcKw: {
        type: String,
        required: true
    },
    systemType: {
        type: String,
        required: true
    },
    structure: {
        type: String,
        required: true
    },
    // bomId: {
    //     type: String,
    //     required: true,
    //     // unique: false
    // },
    // bomId:{
    //      type: mongoose.Schema.Types.ObjectId,
    //     ref: "BOM",
    //     unique: false
    // },
    lead: {

        type: mongoose.Schema.Types.ObjectId,
        ref: "Leads"
    },
    productTable: [{

        productType: { type: String },
        products: [{
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            },
            productMaterial: { type: String },
            productSpecification: { type: String },
            productBrand: { type: String },
            quantity: { type: Number },
            unit: { type: String },
            priceByUnits: { type: String },
            price: { type: Number },
        }]
    }],
    subTotal: { type: Number },
    total: { type: Number },
    purCoastedBomStatus: {
        type: String,
        enum: ["pending", "approved", "deny"],
        default: "pending"
    },
    fCoastedBomStatus: {
        type: String,
        enum: ["pending", "approved", "deny"],
        default: "pending"
    },
    pCoastedBomStatus: {
        type: String,
        enum: ["pending", "approved", "deny", "completed"],
        default: "pending"
    },
    coastedBomStatus: {
        type: String,
        enum: ["pending", "completed"],
        default: "pending"
    },
    createdBy: {
        type: String
    }

}, { timestamps: true });

const CoastedBom = mongoose.model("CoastedBom", coastedBomSchema);
export default CoastedBom;



