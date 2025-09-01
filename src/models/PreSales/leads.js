import mongoose from "mongoose";


const extraMaterialSchema = new mongoose.Schema({
  name: String,
  amount: Number,
  expDate: Date,
  totalAmount: Number

}, { timestamps: true });


const Leadschema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: [String],
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    phoneNo: {
      type: [String],
      required: true,
      match: [/^\+?\d{10,15}$/, "Phone number must be 10 to 15 digits"],
    },
    companyName: {
      type: String,
      required: false,
      trim: true,
    },
    leadSource: {
      type: String,
      required: false,
    },
    leadSourceType: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: [
        "new-leads",
        "lost-leads",
        "follow-up",
        "no-answered",
        "qualified",
        "interested",
      ],
      default: "new-leads",
    },
    extraMaterials: [extraMaterialSchema],

    workStatus: {
      type: String,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    qualifiedDate: {
      type: Date,
    },
    notes: [
  {
    text: String,
    addedBy: String,
    addedDate: Date,
    visibleTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    visibleToAll: { type: Boolean, default: false }
  }
],
    siteNotes: [
      {
        text: { type: String },
        addedBy: { type: String },
        addedDate: { type: Date },
      },
    ],
    estimateProjectValye: [{
      name: {
        type: String
      },
      amount: {
        type: Number
      },
      expDate: {
        type: Date
      }
    }],
    files: [
      {
        fileName: { type: String },
        files: { type: String },
        addedBy: { type: String },
        addedDate: { type: Date },
      },
    ],
    siteFiles: [
      {
        fileName: { type: String },
        files: { type: String },
        addedBy: { type: String },
        addedDate: { type: Date },
      },
    ],
    designFiles: [
      {
        fileName: { type: String },
        files: { type: String },
        addedBy: { type: String },
        addedDate: { type: Date },
        status: { type: String, enum: ["pending", "approved", "redesign"], default: "pending" },
        decisionBy: String,
        decisionAt: Date
      },
    ],
    projectProcessStatus: {
      type: String
    },
    followUpPeriod: {
      type: Date,
      required: false,
    },
    folloeUpNotes: {
      type: String,
      required: false,
    },
    lostReason: {
      type: String,
      required: false,
    },
    siteDetails: {
      siteName: {
        type: String,
        required: false,
      },
      siteLocation: {
        type: String,
        required: false,
      },
      siteImage: {
        type: String,
        required: false,
      },
      specificInfo: {
        type: String,
        required: false,
      },
      googleLocationOrCoordinates: {
        type: String,
        required: false,
      },
      clientInput: {
        type: String,
        required: false,
      },
      scheduleDate: {
        type: Date,
        default: null,
      },
      scheduleTime: {
        type: String,
        required: false,
      },
    },
    siteVisitDetails: {
      latitude: {
        type: String,
      },
      longitude: {
        type: String,
      },
      typeOfSolution: {
        type: String,
        // required: true
      },
      expectedDateOfInstallation: {
        type: String,
        // required: true
      },
      notes: {
        type: String,
        // required: true
      },
      freeAreaAvailableOnRoof: {
        type: String,
        // required: true
      },
      freeAreaAvailableOnGround: {
        type: String,
        // required: true
      },
      roofType: {
        type: String,
        // required: true
      },
      roofAngle: {
        type: String,
        // required: true
      },
      addedBy: {
        type: String
      },
      addedDate: {
        type: Date
      }
    },
    designerSiteVisitDetails: {
      scheduleDate: {
        type: Date,
        default: null,
      },
      scheduleTime: {
        type: String,
        required: false,
      },
    },
    design: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Design",
    },
    bom: [
      {
        bomId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "BOM",
        },
        addedBy: { type: String },
        addedDate: { type: Date },
      },
    ],
    coastedBom: [
      {
        coastedBomId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "CoastedBom",
        },
        addedBy: { type: String },
        addedDate: { type: Date },
      },
    ],
    taskActivities: {
      type: Map,
      of: [{
        processName: String,
        completedBy: String,
        completedAt: Date
      }]
    },
    designPerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    preSalesPerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    purchasesPerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    financeAnalysisPerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    procurementPerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    projectPerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    storePerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedBom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BOM",
    },
    salesStatus: {
      type: String,
    },
    designStatus: {
      type: String,
    },
    purchaseStatus: {
      type: String,
    },
    procurementStatus: {
      type: String,
    },
    storeStatus: {
      type: String,
    },
    salesUpdatedAt: {
      type: Date,
    },
    designUpdatedAt: {
      type: Date,
    },
    purchaseUpdatedAt: {
      type: Date,
    },
    financeAnalysisUpdatedAt: {
      type: Date,
    },
    procurementUpdatedAt: {
      type: Date,
    },
    storeUpdatedAt: {
      type: Date,
    },

    stageUpdatedAt: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ["High", "Low", "Medium"],
    },
    designerDateTime: {
      type: Date,
    },
    designCurrentDateTime: {
      type: Date,
    },
    preSaleAssignOn: {
      type: Date,
    },
    purchasesAssignOn: {
      type: Date,
    },
    financeAnalyzAssignOn: {
      type: Date,
    },
    procurementAssignOn: {
      type: Date,
    },
    storeAssignOn: {
      type: Date,
    },
    designAssignOn: {
      type: Date,
    },
    leadWonStatus: {
      type: String,
      default: "pending",
    },
    otherProductBOM: [
      {
        productType: {
          type: String,
          default: "Others",
        },
        quantity: {
          type: Number,
          default: 0,
        },
        material: {
          type: String,
        },
        specification: {
          type: String,
        },
        brand: {
          type: String,
        },
        unit: {
          type: String,
        },
        stock: {
          type: Number,
        },
        outOfStockThreshold: {
          type: Number,
        },
        priceByUnits: {
          type: Number,
        },
        price: {
          type: Number,
        },
      },
    ],
    costAnalysisChckHistory: [{
      checkBy: String,
      checkedDate: Date
    }],
    projectForcasting: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectForcasting"
    },
    quatation: [
      {
        quatationId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Quatation"
        },
        addedBy: { type: String },
        addedDate: { type: Date },
        status: { type: String },
      },
    ],

    inventoryChckHistory: [{
      checkBy: String,
      checkedDate: Date
    }],
    sampleQuotes: [{
      quotes: Number,
      addedBy: String,
      addedDate: Date
    }],
    recordReceipt: [{
      paymentMode: String,
      receivedAmount: Number,
      recivedDate: Date,
      addedBy: String,
    }],
    balanceAmount: Number,
    totalAmount: Number,
    deliverySchedule: [{
      addressLine1: {
        type: String
      },
      addressLine2: {
        type: String
      },
      city: {
        type: String
      },
      state: {
        type: String
      },
      pinCode: {
        type: String
      },
      date: {
        type: Date
      },
      time: {
        type: String
      },
      notes: {
        type: String
      },
      deliveryChallan: {
        type: String
      },
      addedBy: {
        type: String
      },
      addedDate: {
        type: Date
      }
    }],
    totalReturnQty: Number,
    finalizedTotalAmt: Number,
  },

  { timestamps: true }
);

const Leads = mongoose.model("Leads", Leadschema);
export default Leads;
