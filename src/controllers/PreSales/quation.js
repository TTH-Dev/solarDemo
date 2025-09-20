import Quotation from "../../models/PreSales/quation.js";
import Leads from "../../models/PreSales/leads.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import APIFeatures from "../../utils/ApiFeatures.js";
import User from "../../models/Members/User.js";
import CoastedBom from "../../models/PreSales/coastedBom.js";
import Admin from "../../models/Admin/admin.js";

export const createQuotation = catchAsync(async (req, res) => {
    const { userId, lead } = req.body;


    const user = await User.findById(userId) || await Admin.findById(userId);

    req.body.addedBy = user.name;
    req.body.addedDate = Date.now();

    const quotation = await Quotation.create(req.body);

    const data = {
        addedBy: user.name,
        addedDate: Date.now(),
        quatationId: quotation._id
    }

    await Leads.findByIdAndUpdate(
        lead,
        {
            $push: { quatation: data },
            $set: { totalAmount: quotation.total },
            $set: { balanceAmount: quotation.total }
        },
        {
            new: true,
            runValidators: true
        }
    );

    res.status(201).json({
        status: "success",
        data: {
            quotation,
        },
    });
});

// READ ALL
export const getAllQuotations = catchAsync(async (req, res) => {
    const limit = req.query.limit || 10;
    const page = req.query.page || 1;

    const filter = req.query.lead ? { lead: req.query.lead } : {};

    const features = new APIFeatures(Quotation.find(filter).populate("lead"), req.query)
        .limitFields()
        .sort()
        .paginate();

    const quotations = await features.query;
    const totalRecords = await Quotation.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "success",
        totalPages,
        currentPage: page,
        result: quotations.length,
        data: { quotations },
    });
});

// READ ONE
export const getQuotationById = catchAsync(async (req, res, next) => {
    const quotation = await Quotation.findById(req.params.id).populate("lead").populate({
      path: "CoastedBom",
      model: "CoastedBom",
     
    });
    const coastedBomIds = quotation.lead.coastedBom.map((item) => item.coastedBomId);

  // Fetch all coastedBom documents with full population
  const coastedBoms = await CoastedBom.find({ _id: { $in: coastedBomIds } })
    .populate({
      path: "productTable.products.productId",
      model: "Product"
    });

    if (!quotation) {
        return next(new AppError("Quotation not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: { quotation, coastedBoms },
    });
});

// UPDATE
export const updateQuotation = catchAsync(async (req, res, next) => {
    const updatedQuotation = await Quotation.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!updatedQuotation) {
        return next(new AppError("Quotation not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: { updatedQuotation },
    });
});

// DELETE
export const deleteQuotation = catchAsync(async (req, res, next) => {
    const deletedQuotation = await Quotation.findByIdAndDelete(req.params.id);

    if (!deletedQuotation) {
        return next(new AppError("Quotation not found", 404));
    }

    res.status(204).json({
        status: "success",
        data: null,
    });
});
