import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema({

    name: {
        type: String,
        trim: true,
        required: true
    },
    phoneNo: [{
        type: String,
        required: true
    }],
    location: {
        type: String,
        required: true
    },
    gstNo: {
        type: String,
        // required: true
    },
    contactPerson: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
}, { timestamps: true });

const Vendor = mongoose.model("Vendor", vendorSchema);

export default Vendor;