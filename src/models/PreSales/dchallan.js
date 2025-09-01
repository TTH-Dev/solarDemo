import mongoose from "mongoose";

const dchallanSchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Leads",
    },
    total:{
        type:Number
    },
    addedDate:{
        type:Date
    },addedBy:{
        type:String
    },
    paymentMode: {
      type: String,
    },
    buyersOrderNo:{
      type: String,
    },
    deliveryChallanId: {
        type: String,
        unique: true,
        default: () => `DC-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    },
    date: {
      type: Date,
    },
    deliveryNote: {
      type: String,
    },
    dispatchDocNO: {
      type: String,
    },
    dispatchThrough: {
      type: String,
    },
    termsodDelivery: {
      type: String,
    },
    shipToConsignee: {
      businessName: {
        type: String,
      },
      address: {
        type: String,
      },
      city: {
        type: String,
      },
      pinCode: {
        type: String,
      },
      phone1: {
        type: String,
      },
      phone2: {
        type: String,
      },
    },
    shipToBuyer: {
      businessName: {
        type: String,
      },
      address: {
        type: String,
      },
      city: {
        type: String,
      },
      pinCode: {
        type: String,
      },
      phone1: {
        type: String,
      },
      phone2: {
        type: String,
      },
    },
    receiverName: {
        type: String,
    },
    deliveryChallan: {
        type: String,
    },
    

    status: { type: String,  enum: ["pending", "dispatched", "delivered"],
  default: "pending",},
    challanDesc: [
      {
        description: {
          type: String,
        },
        specification: {
          type: String,
        },
        brand: {
          type: String,
        },
        material: {
          type: String,
        },
        hsn: {
          type: String,
        },
        unit: {
          type: String,
          required: true
        },
        qty: {
          type: Number,
        },
        unitPrice: {
          type: Number,
        },
        totalAmount: {
          type: Number,
        },
      },
    ],
  },
  { timestamps: true }
);

const Dchallan = mongoose.model("Dchallan", dchallanSchema);

export default Dchallan;
