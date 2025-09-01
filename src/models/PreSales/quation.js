import mongoose from "mongoose";



const quationSchema = new mongoose.Schema({

    costumerDetail: {
        projectOrCompanyName: {
            type: String
        },
        address: {
            type: String
        },
        date: {
            type: Date
        },
        invoice: {
            type: String
        },
        invoiceDate: {
            type: String
        },
        paymentMode: {
            type: String
        },
        city: {
            type: String
        },
        pinCodePostalCode: {
            type: String
        },
        phoneNo1: {
            type: String
        },
        phoneNo2: {
            type: String
        },
        contactPerson1: {
            type: String
        },
        contactPerson2: {
            type: String
        },

        quotationNumber: {
            type: String,
            required: true
        },
        warmregards: {
            type: String
        }
    },
    CoastedBom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CoastedBom"
    },
    lead: {

        type: mongoose.Schema.Types.ObjectId,
        ref: "Leads"
    },


    productTable: [{
        productType: { type: String },
        products: [{
            // productId: {
            //     type: mongoose.Schema.Types.ObjectId,
            //     ref: "Product"
            // },
            productName: { type: String },
            capacity: {
                type: Number
            },
            unit: { type: String },
            price: { type: Number },
            totalAmount: { type: Number }
        }]
    }],
    salesQuatation: [
        {
            description: {
                type: String,
            },
            capacity: {
                type: String,
            },
            totalAmount: {
                type: String,
            },
        }
    ],

    subTotal: { type: Number },
    total: { type: Number },
    discount: { type: Number },
    tax1: { type: Number },
    tax2: { type: Number },

    quationStatus: {
        type: String,
        default: "pending"
    },
    termAndCondition: {
        type: String
    },
    amc: {
        type: String
    },
    warranty: {
        type: String
    },
    paymentTerms: {
        type: String
    },
    addedBy: {
        type: String
    },
    addedDate: {
        type: Date
    },


}, { timestamps: true });


const Quation = mongoose.model("Quation", quationSchema);

export default Quation;