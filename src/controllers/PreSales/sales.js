import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import APIFeatures from "../../utils/ApiFeatures.js";
import Sales from "../../models/PreSales/sales.js";

export const createSales = catchAsync(async (req, res, next) => {
  const sales = await Sales.create(req.body);

  res.status(200).json({
    status: "Success",
    data: {
      sales,
    },
  });
});

export const getAllSales = catchAsync(async (req, res, next) => {
  const limit = req.query.limit || 10;
  const page = req.query.page || 1;

  const features = new APIFeatures(Sales.find().populate("lead"), req.query)
    .limitFields()
    .sort()
    .paginate();

  const sales = await features.query;

  const totalRecords = await Sales.countDocuments();
  const totalPages = Math.ceil(totalRecords / limit);

  res.status(200).json({
    status: "success",
    totalPages,
    currentPage: page,
    result: sales.length,
    data: { sales },
  });
});

export const getSalesById = catchAsync(async (req, res, next) => {
  const sales = await Sales.findById(req.params.id);

  if (!sales) {
    return next(new AppError("Leads not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { sales },
  });
});

export const updateSales = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const updatedSales = await Sales.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedSales) {
    return next(new AppError("Sales not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { updatedSales },
  });
});

export const deleteSales = catchAsync(async (req, res, next) => {
  const deletedSales = await Sales.findByIdAndDelete(req.params.id);

  if (!deletedSales) {
    return next(new AppError("Sales not found", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
