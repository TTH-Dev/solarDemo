import mongoose from "mongoose";

// Vendor + price structure
const productVendorSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  price: { type: Number, default: 0 },
  isSelected: { type: Boolean, default: false }, // optional
});

const productSchema = new mongoose.Schema({
  productMaterial: String,
  productSpecification: String,
  productBrand: String,
  requestQty: Number,
  quantity: Number,
  balQuantity: Number,
  unit: String,

  // ✅ per-product vendors with price
  vendors: [productVendorSchema],

  attachments: [{ type: String }],
});

const groupedProductSchema = new mongoose.Schema({
  productType: String,
  products: [productSchema],
  status: { type: String, default: "draft" },
});

const performInvoiceSchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Leads",
    },
    groupedProducts: [groupedProductSchema],
    totalAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["draft", "requested", "approved", "purchased"],
      default: "draft",
    },
        fStatus: {
      type: String,
      enum: ["draft", "requested", "approved", "purchased"],
      default: "draft",
    },
  },
  { timestamps: true }
);

const PerformInvoice = mongoose.model("PerformInvoice", performInvoiceSchema);

export default PerformInvoice;
