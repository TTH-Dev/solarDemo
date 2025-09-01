import mongoose from "mongoose";

const designigSchema = new mongoose.Schema({


},
    { timestamps: true });


const Design = mongoose.model("Design", designigSchema);
export default Design