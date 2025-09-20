import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import APIFeatures from "../../utils/ApiFeatures.js";
import wonCustomer from "../../models/WonCustomer.js";

export const getAllWonCustomer = catchAsync(async (req, res, next) => {
  const limit = req.query.limit || 10;
  const page = req.query.page || 1;
  const skip = (page - 1) * limit;

  let filter = {};

  if (req.query.name) {
    filter.contactName = req.query.name;
  }
  if (req.query.primaryEmail) {
    filter.primaryEmail = req.query.primaryEmail;
  }
  const data = await wonCustomer
    .find(filter)
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 }).populate("project");

  const totalRecords = await wonCustomer.countDocuments();
  const totalPages = Math.ceil(totalRecords / limit);
  res.status(200).json({
    message: "Success",
    data,
    totalPages,
  });
});



export const deleteWonCustomer=catchAsync(async(req,res,next)=>{

    const data=await wonCustomer.findByIdAndDelete(req.query.id)

    res.status(200).json({
        data,
        message:"Success"
    })

})


export const getWonCustomerByID=catchAsync(async(req,res,next)=>{
    if(!req.query.id){
        return next(new AppError("Edit id need in query!",400))
    }
    const data=await wonCustomer.findOne({_id:req.query.id}).populate({
    path: "project", 
    populate: {
      path: "lead",   
      model: "Leads",
    }})

    res.status(200).json({
        data,
        message:"Success"
    })

})

export const updateWonCustomerByID=catchAsync(async(req,res,next)=>{
    if(!req.query.id){
        return next(new AppError("id need in query!",400))
    }
    const data=await wonCustomer.findByIdAndUpdate(req.query.id,req.body)

    res.status(200).json({
        data,
        message:"Success"
    })

})