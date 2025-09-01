import mongoose from "mongoose";

const historySchema = new mongoose.Schema([{
    historyFor: {
        type: String,
        enum: ["pipeLine", "sales", "design", "purchase", "procurement", "store"]
    },
    lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lead",
    },
    processName: {
        type: String
    },
    finishDate: { type: String },

    finishedBy: {
        type: String
    },
}], { timestamps: true });

const History = mongoose.model("History", historySchema);
export default History;


