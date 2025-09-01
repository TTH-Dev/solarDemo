import mongoose from "mongoose";

const designigSchema = new mongoose.Schema(
  {
    moduleFor: {
      type: String,
      enum: ["sales", "pipeline", "design", "purchase", "procurement", "store"],
    },
    processes: [
      {
        name: { type: String, required: true },
        tasks: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
          },
        ],
      },
    ],
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
    },
  },
  { timestamps: true }
);

const Design = mongoose.model("Design", designigSchema);
export default Design;
