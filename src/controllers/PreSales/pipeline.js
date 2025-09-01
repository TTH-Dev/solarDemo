import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import APIFeatures from "../../utils/ApiFeatures.js";
import PipeLine from "../../models/PreSales/pipeline.js"
import User from "../../models/Members/User.js";

export const createPipeLine = catchAsync(async (req, res, next) => {

    const pipeLine = await PipeLine.create(req.body);

    res.status(200).json({
        status: "Success",
        data: {
            pipeLine,
        }
    });
});


export const getAllPipeLine = catchAsync(async (req, res, next) => {
    const limit = req.query.limit || 10;
    const page = req.query.page || 1;

    const features = new APIFeatures(PipeLine.find().populate("lead"), req.query)
        .limitFields()
        .sort()
        .paginate();

    const pipeLine = await features.query;

    const totalRecords = await PipeLine.countDocuments();
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "success",
        totalPages,
        currentPage: page,
        result: pipeLine.length,
        data: { pipeLine },
    });
});

export const getPipeLineById = catchAsync(async (req, res, next) => {
    const pipeLine = await PipeLine.findById(req.params.id);

    if (!pipeLine) {
        return next(new AppError("Leads not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: { pipeLine },
    });

});

export const updatePipeLine = catchAsync(async (req, res, next) => {
    const { id } = req.params;


    const updatedPipeLine = await PipeLine.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!updatedPipeLine) {
        return next(new AppError("PipeLine not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: { updatedPipeLine },
    });
});

export const deletePipeLine = catchAsync(async (req, res, next) => {
    const deletedPipeLine = await PipeLine.findByIdAndDelete(req.params.id);

    if (!deletedPipeLine) {
        return next(new AppError("PipeLine not found", 404));
    }

    res.status(204).json({
        status: "success",
        data: null,
    });
});




