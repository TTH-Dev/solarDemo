import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({

  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Leads",
  },

  companyName: {
    type: String
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
  contactName: {
    type: String
  },
   project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
  },

},
  { timestamps: true });

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;