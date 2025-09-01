import mongoose from "mongoose";

const returnmaterialSchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Leads",
    },
    addedBy: {
      type: String,
    },
    addedDate: {
      type: Date,
    },

    productTable: [
      {
        productType: { type: String },
        products: [
          {
            productId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Product",
            },
            productMaterial: { type: String },
            productSpecification: { type: String },
            totalQuntity: { type: Number },
            usedQuntity: { type: Number },
            goodQuntity: { type: Number },
            defectQuntity: { type: Number },
            badDefectQuntity: { type: Number },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

const ReturnMaterial = mongoose.model("ReturnMaterial", returnmaterialSchema);
export default ReturnMaterial;
