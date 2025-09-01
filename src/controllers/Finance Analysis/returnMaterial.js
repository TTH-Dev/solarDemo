import ReturnMaterial from "../../models/Finance Analysis/returnMaterial.js";
import Product from "../../models/Inventory/products.js";
import Lead from "../../models/PreSales/leads.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import APIFeatures from "../../utils/ApiFeatures.js"
import User from "../../models/Members/User.js"

export const createReturnMaterial = catchAsync(async (req, res, next) => {
    const { lead, productTable,userId } = req.body;

    let totalReturnQty = 0;

    for (const group of productTable) {
        for (const item of group.products) {
            if (item?.productId && item?.goodQuntity) {
                await Product.findByIdAndUpdate(item.productId, {
                    $inc: { stock: item.goodQuntity },
                });

                totalReturnQty += item.goodQuntity;
            }
        }
    }

    const df=await User.findById(userId)

    const gh={...req.body,addedBy:df.name,addedDate:new Date()}

    const data = await ReturnMaterial.create(gh);

    await Lead.findByIdAndUpdate(lead, {
        $inc: { totalReturnQty: totalReturnQty },
    });

    res.status(201).json({
        status: "success",
        data,
    });
});


// Get All with APIFeatures
export const getAllReturnMaterials = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(
        ReturnMaterial.find().populate("lead").sort({ createdAt: -1 }),
        req.query
    )
        .sort()
        .limitFields()
        .paginate();

    const data = await features.query;

    res.status(200).json({
        status: "success",
        results: data.length,
        data,
    });
});

// Get Single
export const getSingleReturnMaterial = catchAsync(async (req, res, next) => {
    const data = await ReturnMaterial.findById(req.params.id).populate("lead");

    if (!data) {
        return next(new AppError("Return Material not found", 404));
    }

    res.status(200).json({
        status: "success",
        data,
    });
});

// Update
export const updateReturnMaterial = catchAsync(async (req, res, next) => {
    const data = await ReturnMaterial.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!data) {
        return next(new AppError("Return Material not found", 404));
    }

    res.status(200).json({
        status: "success",
        data,
    });
});

// Delete
export const deleteReturnMaterial = catchAsync(async (req, res, next) => {
    const data = await ReturnMaterial.findByIdAndDelete(req.params.id);

    if (!data) {
        return next(new AppError("Return Material not found", 404));
    }

    res.status(204).json({
        status: "success",
        data: null,
    });
});


export const getReturnmaterialByLead=catchAsync(async(req,res)=>{
    const {leadId}=req.query
   
    
    const data=await ReturnMaterial.find({lead:leadId})

   
 
  
    
    res.status(200).json({
        status: "success",
       data,
    });
})
