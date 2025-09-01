import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema(
  {
    moduleFor: {
      type: String,
      enum: [
        "pipeLine",
        "sales",
        "design",
        "purchase",
        "procurement",
        "store",
        "finance",
      ],
    },
    moduleName: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

const Modules = mongoose.model("Modules", moduleSchema);
export default Modules;
