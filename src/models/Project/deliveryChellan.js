import mongoose from "mongoose";

const deliveryChellanSchema = new mongoose.Schema({

    deliveryNote: {
        modeOfPayment: String,
        buyesOrderNod: String,
        dispatchDocNo: String,
        DispatchThrough: String,
        date: Date,
        deliveryNote: String,
        termsOfDelivery: String,
    },
    shipToDetails: {
        businnessName: String,
        addredd: String,
        city: String,
        pinCodePostCode: String,
        phoneNo1: String,
        phoneNo2: Number
    },
    billToDetails: {
        businnessName: String,
        addredd: String,
        city: String,
        pinCodePostCode: String,
        phoneNo1: String,
        phoneNo2: Number
    },
    reciverName: {
        type: String,
        required: true
    },
    deliveryChallan: {
        type: String,
    },
    lead: {

        type: mongoose.Schema.Types.ObjectId,
        ref: "Leads"
    },

    createdBy: {
        type: String
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
        }]
    }],
}, { timestamps: true });

const DeliveryChellan = mongoose.model("DeliveryChellan", deliveryChellanSchema);
export default DeliveryChellan;


