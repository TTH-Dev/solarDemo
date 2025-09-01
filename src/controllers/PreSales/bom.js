import BOM from "../../models/PreSales/bom.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import APIFeatures from "../../utils/ApiFeatures.js";
import User from "../../models/Members/User.js";
import Leads from "../../models/PreSales/leads.js";
import Admin from "../../models/Admin/admin.js"

export const createBOM = catchAsync(async (req, res, next) => {
    const { siteName, qcKw, productTable, systemType, subTotal, structure, total, userId, leadId } = req.body;

    const data = {
        siteName: siteName,
        qcKw: qcKw,
        lead: leadId,
        productTable: productTable,
        systemType: systemType,
        structure: structure,
        subTotal: subTotal,
        total: total
    }



    let user = await User.findById(userId);

    if (!user) {
        user = await Admin.findById(userId)
    }

    const lead1 = await Leads.findById(leadId);

    if (!lead1) {
        return res.status(404).json({
            status: "Fail",
            message: "Lead not found"
        });
    }

    if (lead1.bom && lead1.bom.length > 0) {
        return res.status(400).json({
            status: "Fail",
            message: "A BOM already exists for this lead"
        });
    }
    const bom = await BOM.create(data);

    const leadData = {
        bomId: bom._id,
        addedBy: user.name,
        addedDate: Date.now()
    }

    const lead = await Leads.findByIdAndUpdate(
        leadId,
        { $push: { bom: leadData } },
        { new: true }
    );

    res.status(200).json({
        status: "Success",
        data: {
            bom,
            lead
        }
    });
});

export const getAllBOM = catchAsync(async (req, res, next) => {
    const limit = req.query.limit || 10;
    const page = req.query.page || 1;


    let filer = {};

    if (req.query.lead) {
        filer.lead = req.query.lead
    }
    if (req.query.bomStatus) {
        filer.bomStatus = req.query.bomStatus
    }


    const features = new APIFeatures(BOM.find(filer), req.query)
        .limitFields()
        .sort()
        .paginate();

    const bom = await features.query;

    const totalRecords = await BOM.countDocuments(filer);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "success",
        totalPages,
        currentPage: page,
        result: bom.length,
        data: { bom },
    });
});

export const getBOMById = catchAsync(async (req, res, next) => {
    const bom = await BOM.findById(req.params.id).populate({
        path: "productTable.products.productId",
        model: "Product",
    });

    if (!bom) {
        return next(new AppError("Bom not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: { bom },
    });

});

export const getBOMById1 = catchAsync(async (req, res, next) => {
    const bom = await BOM.findById(req.params.id)
        .populate({
            path: "productTable.products.productId",
            model: "Product",
        });

    if (!bom) {
        return next(new AppError("BOM not found", 404));
    }

    // Extract specific fields
    const response = {
        siteName: bom.siteName || "",
        qcKw: bom.qcKw || "",
        leadId: bom.lead?._id || null,
        productTable: bom.productTable || [],
        subTotal: bom.subTotal || 0,
        total: bom.total || 0,
    };

    res.status(200).json({
        status: "success",
        data: response,
    });
});

// export const updateBOM = catchAsync(async (req, res, next) => {
//     const { id } = req.params;
//     const { userId } = req.body;

//     const bom = await BOM.findById(id);
//     if (!bom) {
//         return next(new AppError("BOM not found", 404));
//     }

//     if (req.body.bomStatus === "approved") {
//         const existingCoastedBom = await CoastedBom.findOne({ bomId: bom._id, });

//   if (existingCoastedBom) {
//     // ✅ Update bomStatus even if Coasted BOM already exists
//     bom.bomStatus = "approved";
//     await bom.save();

//     return res.status(200).json({
//       status: "success",
//       message: "Coasted BOM already exists for this lead. BOM status updated.",
//       data: { coastedBom: existingCoastedBom, bom },
//     });
//   }
//         const data = {
//             siteName: bom.siteName,
//             structure: bom.structure,
//             systemType: bom.systemType,
//             qcKw: bom.qcKw,
//             lead: bom.lead,
//             productTable: bom.productTable,
//             subTotal: bom.subTotal,
//             total: bom.total,
//              bom: bom._id
//         };

//         const coastedBom = await CoastedBom.create(data);


//         let user = await User.findById(userId);
//         if (!user) {
//             user = await Admin.findById(userId)
//         }

//         const leadData = {
//             coastedBomId: coastedBom._id,
//             addedBy: user.name,
//             addedDate: Date.now()
//         }

//         await Leads.findByIdAndUpdate(
//             bom.lead,
//             { $push: { coastedBom: leadData }, approvedBom: bom._id },
//             { new: true }
//         );

//         bom.bomStatus = "approved";
//         await bom.save();

//         return res.status(200).json({
//             status: "success",
//             data: { coastedBom, bom },
//         });
//     }

//     const updatedBOM = await BOM.findByIdAndUpdate(id, req.body, {
//         new: true,
//         runValidators: true,
//     });

//     res.status(200).json({
//         status: "success",
//         data: { updatedBOM },
//     });
// });

export const updateBOM = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { userId } = req.body;
    const { notes } = req.body;

    const bom = await BOM.findById(id);
    if (!bom) {
        return next(new AppError("BOM not found", 404));
    }
    //  if (String(bom.createdBy) === String(userId)) {
    //     bomStatus  = "pending";
    //     fBomStatus = "pending";
    // }
    if (req.body.bomStatus !== "approved") {
        // if (!req.body.notes || req.body.notes.trim() === "") {
        //     return next(new AppError("Notes are required for non-approved BOMs", 400));
        // }

        bom.notes = notes;
    }
    if (req.body.bomStatus === "approved") {
         bom.notes = "";
        const data = {
            siteName: bom.siteName,
            qcKw: bom.qcKw,
            systemType: bom.systemType,
            structure: bom.structure,
            lead: bom.lead,
            bom: bom._id,
            productTable: bom.productTable,
            subTotal: bom.subTotal,
            total: bom.total,
        };

        // const coastedBom = await CoastedBom.create(data);

        // const user = await User.findById(userId);


        // const leadData = {
        //     coastedBomId: coastedBom._id,
        //     addedBy: user.name,
        //     addedDate: Date.now()
        // }

        // await Leads.findByIdAndUpdate(
        //     bom.lead,
        //     { $push: { coastedBom: leadData }, approvedBom: bom._id },
        //     { new: true }
        // );

        bom.bomStatus = "approved";
        await bom.save();

        return res.status(200).json({
            status: "success",
            data: {  bom }, //coastedBom,
        });
    }

    const updatedBOM = await BOM.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        status: "success",
        data: { updatedBOM },
    });
});



export const deleteBOM = catchAsync(async (req, res, next) => {
    const deletedBOM = await BOM.findByIdAndDelete(req.params.id);

    if (!deletedBOM) {
        return next(new AppError("BOM not found", 404));
    }

    res.status(204).json({
        status: "success",
        data: null,
    });
});

export const getInventoryCheck = catchAsync(async (req, res, next) => {
    const { leadId } = req.params;

    const approvedBOMs = await BOM.find({ lead: leadId, bomStatus: "approved", fBomStatus: "approved" }).populate({
        path: "productTable.products.productId",
        model: "Product"
    });

    if (!approvedBOMs.length) {
        return res.status(404).json({ status: "fail", message: "No approved BOMs found for this lead" });
    }

    res.status(200).json({
        status: "success",
        data: approvedBOMs
    });
});
// controllers/bomController.js
export const updateProjectExtraRequestQuantity = catchAsync(async (req, res, next) => {
  const { bomId, productId } = req.params;
  const { projectExtraRequestQuantity } = req.body;

  if (projectExtraRequestQuantity == null) {
    return next(new AppError("Quantity is required", 400));
  }

  // Find BOM and update nested product
  const bom = await BOM.findOneAndUpdate(
    { _id: bomId, "productTable.products._id": productId },
    {
      $set: {
        "productTable.$[].products.$[product].projectExtraRequestQuantity": projectExtraRequestQuantity,
      },
    },
    {
      arrayFilters: [{ "product._id": productId }],
      new: true,
    }
  );

  if (!bom) {
    return next(new AppError("Product not found in BOM", 404));
  }

  res.status(200).json({
    status: "success",
    data: { bom },
  });
});

export const extraProduct = catchAsync(async (req, res, next) =>{
    try {
    const { bomId } = req.params;
    const { items } = req.body; // array of extra items

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "No extra items provided" });
    }

    const bom = await BOM.findById(bomId);
    if (!bom) {
      return res.status(404).json({ message: "BOM not found" });
    }

    // ✅ Check if there’s already a productType "Extra Items"
    let extraSection = bom.productTable.find(
      (pt) => pt.productType === "Extra Items"
    );

    if (!extraSection) {
      extraSection = { productType: "Extra Items", products: [] };
      bom.productTable.push(extraSection);
    }

    // ✅ Push new items
    items.forEach((item) => {
      extraSection.products.push({
        productMaterial: item.productMaterial,
        productSpecification: item.productSpecification,
        productBrand: item.productBrand,
        projectExtraRequestQuantity: item.projectExtraRequestQuantity || 0,
      });
    });

    await bom.save();

    res.status(201).json({
      status: "success",
      message: "Extra products added successfully",
      data: bom,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
})