import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import APIFeatures from "../../utils/ApiFeatures.js";
import Purchase from "../../models/PreSales/purchase.js";
import Product from "../../models/Inventory/products.js"

export const createPurchase = catchAsync(async (req, res, next) => {

    const purchase = await Purchase.create(req.body);

    res.status(200).json({
        status: "Success",
        data: {
            purchase,
        }
    });
});

export const getAllPurchase = catchAsync(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const leadId = req.query.leadId;

    // Build query object
    const queryObj = {};
    if (leadId) {
        queryObj.lead = leadId;
    }

    const features = new APIFeatures(Purchase.find(queryObj).populate("lead"), req.query)
        .limitFields()
        .sort()
        .paginate();

    const purchase = await features.query;

    const totalRecords = await Purchase.countDocuments(queryObj);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "success",
        totalPages,
        currentPage: page,
        result: purchase.length,
        data: { purchase },
    });
});

// export const getAllPurchase = catchAsync(async (req, res, next) => {
//     const limit = req.query.limit || 10;
//     const page = req.query.page || 1;

//     const features = new APIFeatures(Purchase.find().populate("lead"), req.query)
//         .limitFields()
//         .sort()
//         .paginate();

//     const purchase = await features.query;

//     const totalRecords = await Purchase.countDocuments();
//     const totalPages = Math.ceil(totalRecords / limit);

//     res.status(200).json({
//         status: "success",
//         totalPages,
//         currentPage: page,
//         result: purchase.length,
//         data: { purchase },
//     });
// });

export const getPurchaseById = catchAsync(async (req, res, next) => {
    const purchase = await Purchase.findById(req.params.id).populate("lead");

    if (!purchase) {
        return next(new AppError("Leads not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: { purchase },
    });

});


export const updatePurchase = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const purchase = await Purchase.findById(id);
    if (!purchase) {
        return next(new AppError("Purchase not found", 404));
    }

    const updatedPurchase = await Purchase.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!updatedPurchase) {
        return next(new AppError("Purchase not found after update", 404));
    }

    for (const group of updatedPurchase.groupedProducts) {
        for (const item of group.items) {
            if (item.productId && item.requestQty && item.purchasedStatus === "Completed") {
                await Product.findByIdAndUpdate(
                    item.productId,
                    { $inc: { stock: item.requestQty } },
                    { new: true }
                );
            }
        }
    }

    res.status(200).json({
        status: "success",
        data: { updatedPurchase },
    });
});


export const deletePurchase = catchAsync(async (req, res, next) => {
    const deletedPurchase = await Purchase.findByIdAndDelete(req.params.id);

    if (!deletedPurchase) {
        return next(new AppError("Purchase not found", 404));
    }

    res.status(204).json({
        status: "success",
        data: null,
    });
});
