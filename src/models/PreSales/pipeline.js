import mongoose from "mongoose";

const pipelineSchema = new mongoose.Schema(
  {
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

const PipeLine = mongoose.model("PipeLine", pipelineSchema);
export default PipeLine;
