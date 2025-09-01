import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    address1: {
      type: String,
      required: true,
    },
    address2: {
      type: String,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    deliveryChallan: {
      type: String,
    },
    deliveryChallanId: {
      type: String,
    },
    addedBy: {
      type: String
    },
    addedDate: {
      type: String
    },
    scheduleStatus: {
      type: String
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Leads",
    },
    status: {
  type: String,
  enum: ["pending", "dispatched", "delivered"],
  default: "pending",
},
  },
  { timestamps: true }
);

const Schedule = mongoose.model("Schedule", scheduleSchema);
export default Schedule;
