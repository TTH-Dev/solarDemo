import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema({

    organizationLogo: {
        type: String
    },
    organizationName: {
        type: String,
        required: true
    },
    organizationAddress: {
        type: String,
        required: true
    },
    websiteLink: {
        type: String
    },
    organizationContactNo: {
        type: String
    },
    organizationEmailId: {
        type: String
    },
    organizationBranch: {
        type: String
    },
    signatureDocument: {
        type: String
    },
    bankName: {
        type: String,
        required: true
    },
    financeAnalysisNo: {
        type: String,
        required: true
    },
    acHolderName: {
        type: String,
        required: true
    },
    ifscCode: {
        type: String,
        required: true
    },
    panNumber: {
        type: String,
        required: true
    },
    gstNumber: {
        type: String,
        required: true
    },
},
    { timestamps: true });

const Organization = mongoose.model("Organization", organizationSchema);
export default Organization;