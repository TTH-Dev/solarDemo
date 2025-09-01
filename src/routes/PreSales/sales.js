import mongoose from "mongoose";

const salesSchema = new mongoose.Schema({


},
    { timestamps: true });


const Sales = mongoose.model("Sales", salesSchema);
export default Sales