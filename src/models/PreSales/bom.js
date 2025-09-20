import mongoose from "mongoose";

const bomSchema = new mongoose.Schema({

    siteName: {
        type: String,
        required: true
    },
    notes: {
        type: String,
    },
    qcKw: {
        type: String,
        required: true
    },
    systemType: {
        type: String,
        // required: true
    },
    structure: {
        type: String,
        // required: true
    },
    finalizeBom: {
        type: String,
        enum: ["pending", "approved", "edited"],
    },
    lead: {

        type: mongoose.Schema.Types.ObjectId,
        ref: "Leads"
    },
    costedBom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CoastedBom",
        unique: false
    },
    productTable: [{
        productType: { type: String },
        products: [{
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: false 
            },
            // productId: {
            //   type: mongoose.Schema.Types.Mixed,
            //   ref: "Product",
            //   required: false,
            // },
            productMaterial: { type: String },
            productSpecification: { type: String },
            productBrand: { type: String },
            requestQuntity: { type: Number },
            projectExtraRequestQuantity: { type: Number },
            requestDate: { type: Date },
            requestStatus: { type: String, enum: ["requested", "receivedInStore", "receivedInStore"] },
            quantity: { type: Number },
            totalReturnQty: { type: Number },
            goodQty: { type: Number },
            defectQty: { type: Number },
            badDebtQty: { type: Number },
            balQuantity: { type: Number },
            unit: { type: String },
            priceByUnits: { type: String },
            price: { type: Number },
            validationStatus: {
                type: String,
                enum: ["right", "wrong"]
            }
        }]
    }],
    subTotal: { type: Number },
    total: { type: Number },
    pipReqProductApproval: {
        type: String,
        enum: ["pending", "approved", "deny"],
        default: "pending"
    },
    finReqProductApproval: {
        type: String,
        enum: ["pending", "approved", "deny"],
        default: "pending"
    },
    bomStatus: {
        type: String,
        enum: ["pending", "approved", "deny"],
        default: "pending"
    },
    fBomStatus: {
        type: String,
        enum: ["pending", "approved", "deny"],
        default: "pending"
    }
}, { timestamps: true });

const BOM = mongoose.model("BOM", bomSchema);
export default BOM;


