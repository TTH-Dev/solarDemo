import mongoose from "mongoose";

const pipelineSchema = new mongoose.Schema({


},
{timestamps:true});


const PipeLine = mongoose.model("PipeLine", pipelineSchema);
export default PipeLine