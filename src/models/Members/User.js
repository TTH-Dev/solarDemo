import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  access: {
    type: Boolean,
    default: false
  },
  profileImage: {
    type: String,
  },
   rollNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  accessModuels: {
    type: [String],
    enum: [
      "leads",
      "pipeline",
      "pre-Sales",
      "purchase",
      "procurement",
      "store",
      "products",
      "project",
      "financeAnalysis",
      "customer",
      "vendor",
      "team",
      "designing"
    ]
  },
  role: {
    type: String,
    enum: ["admin", "user"]
  },
  position:{
    type:String,
  },
  team: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
  }],
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task"
  }],
  lead: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Leads",
  }],
});

const User = mongoose.model("User", userSchema);
export default User;


const accessSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String, required: true }
})

export const Access = mongoose.model("Access", accessSchema);

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 },
});

export const OTP = mongoose.model("OTP", otpSchema);