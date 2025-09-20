import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import APIFeatures from "../../utils/ApiFeatures.js";
import User from "../../models/Members/User.js";
import Leads from "../../models/PreSales/leads.js";
import CoastedBom from "../../models/PreSales/coastedBom.js";
import BOM from "../../models/PreSales/bom.js";
import mongoose from "mongoose";
import Admin from "../../models/Admin/admin.js";

export const createCoastedBom = catchAsync(async (req, res, next) => {
   const { siteName, qcKw, productTable, subTotal, total, structure, systemType, userId, leadId } = req.body;

  const data = {
    siteName: siteName,
    qcKw: qcKw,
    lead: leadId,
    structure,
    systemType,
    productTable: productTable,
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

    if (lead1.coastedBom && lead1.coastedBom.length > 0) {
        return res.status(400).json({
            status: "Fail",
            message: "A Costed BOM already exists for this lead"
        });
    }
    const coastedBom = await CoastedBom.create(data);

      const leadData = {
    coastedBomId: coastedBom._id,
    addedBy: user.name,
    addedDate: Date.now()
  }

    const lead = await Leads.findByIdAndUpdate(
    leadId,
    { $push: { coastedBom: leadData } },
    { new: true }
  );

  res.status(200).json({
    status: "Success",
    data: {
      coastedBom,
      lead
    }
    });
});

export const getAllCoastedBom = catchAsync(async (req, res) => {
  const limit = req.query.limit || 10;
  const page = req.query.page || 1;


  let filer = {};

  if (req.query.lead) {
    filer.lead = req.query.lead
  }
  if (req.query.bomStatus) {
    filer.bomStatus = req.query.bomStatus
  }
  if (req.query.fBomStatus) {
    filer.fBomStatus = req.query.fBomStatus
  }

  const features = new APIFeatures(CoastedBom.find(filer), req.query)
    .limitFields()
    .sort()
    .paginate();

  const coastedBom = await features.query;

  const totalRecords = await CoastedBom.countDocuments(filer);
  const totalPages = Math.ceil(totalRecords / limit);

  res.status(200).json({
    status: "success",
    totalPages,
    currentPage: page,
    result: coastedBom.length,
    data: { coastedBom },
  });
});


export const getCoastedBomById = catchAsync(async (req, res, next) => {
  const coastedBom = await CoastedBom.findById(req.params.id);

  if (!coastedBom) {
    return next(new AppError("Bom not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { coastedBom },
  });

});

export const updateCoastedBom = catchAsync(async (req, res, next) => {
  const { id } = req.params;


  const updatedCoastedBom = await CoastedBom.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedCoastedBom) {
    return next(new AppError("CoastedBom not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { updatedCoastedBom },
  });
});

export const deleteCoastedBom = catchAsync(async (req, res, next) => {
  const deletedCoastedBom = await CoastedBom.findByIdAndDelete(req.params.id);

  if (!deletedCoastedBom) {
    return next(new AppError("CoastedBom not found", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});