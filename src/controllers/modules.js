import Modules from "../models/modules.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import ApiFeatures from "../utils/ApiFeatures.js";

export const createModules = catchAsync(async (req, res, next) => {
    const { moduleFor, moduleName } = req.body;

    if (!moduleFor || !moduleName) {
        return next(new AppError("ModuleFor and ModuleName are Required!", 404));
    }
    const modules = await Modules.create({ moduleName: moduleName, moduleFor: moduleFor });

    res.status(200).json({
        status: "Success",
        data: {
            modules
        }
    });
});

export const getAllModules = catchAsync(async (req, res, next) => {

    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    let filter = {};

    if (req.query.moduleFor) {
        filter.moduleFor = req.query.moduleFor;
    }

    const features = new ApiFeatures(Modules.find(filter), req.query)
        .limitFields()
        .sort()
        .paginate();

    const modules = await features.query;
    const totalRecords = await Modules.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "Success",
        data: {
            result: modules.length,
            totalRecords,
            totalPages,
            modules
        }
    });
})

export const addModelueName = catchAsync(async (req, res, next) => {

    const { id } = req.query;

    const { moduleName } = req.body;

    const lead = await Modules.findByIdAndUpdate(
        id,
        { $push: { moduleName: moduleName } },
        { new: true }
    );
    if (!lead) {
        return next(new AppError("Lead Not Found!", 404));
    }
    res.status(200).json({
        status: "Success",
        data: {
            lead
        }
    });
});

export const removeModelueName = catchAsync(async (req, res, next) => {
    const { id } = req.query;
    const { moduleName } = req.body;
    const lead = await Modules.findByIdAndUpdate(
        id,
        { $pull: { moduleName: moduleName } },
        { new: true }
    );
    if (!lead) {
        return next(new AppError("Lead Not Found!", 404));
    }
    res.status(200).json({
        status: "Success",
        data: {
            lead
        }
    });
});