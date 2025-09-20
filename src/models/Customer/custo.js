import mongoose from "mongoose";

const wonCustomerSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
    },
    customerPhoneNo:{
      type:String
    },
    gstNo:{
      type:String,
    },
    location:{
      type:String
    },
    primaryEmail: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    email:{
      type:[String]
    },
    phoneNo: {
      type: [String],
    },
    contactName: {
      type: String,
    },
    project: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    }],
    customerID: {
      type: String,
    },
  },
  { timestamps: true }
);


wonCustomerSchema.pre("save", async function (next) {
  if (!this.customerID) {
    const lastVendor = await mongoose
      .model("wonCustomer")
      .findOne({}, {}, { sort: { createdAt: -1 } });

    let nextId = "CUS001";
    if (lastVendor && lastVendor.customerID) {
      const lastNumber = parseInt(lastVendor.customerID.replace("CUS", ""), 10);
      nextId = `CUS${String(lastNumber + 1).padStart(3, "0")}`;
    }
    this.customerID = nextId;
  }



  next();
});

const wonCustomer = mongoose.model("wonCustomer", wonCustomerSchema);

export default  wonCustomer;
