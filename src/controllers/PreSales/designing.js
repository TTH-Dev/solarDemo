import Design from "../../models/PreSales/designing.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import APIFeatures from "../../utils/ApiFeatures.js";
import Leads from "../../models/PreSales/leads.js";


export const createDesign = catchAsync(async (req, res, next) => {

    const design = await Design.create(req.body);

    res.status(200).json({
        status: "Success",
        data: {
            design,
        }
    });
});

export const getAllDesign = catchAsync(async (req, res, next) => {
    const limit = req.query.limit || 10;
    const page = req.query.page || 1;

    const features = new APIFeatures(Design.find().populate("lead"), req.query)
        .limitFields()
        .sort()
        .paginate();

    const design = await features.query;

    const totalRecords = await Design.countDocuments();
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "success",
        totalPages,
        currentPage: page,
        result: design.length,
        data: { design },
    });
});

export const getDesignById = catchAsync(async (req, res, next) => {
    const design = await Design.findById(req.params.id);

    if (!design) {
        return next(new AppError("Leads not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: { design },
    });

});

export const updateDesign = catchAsync(async (req, res, next) => {
    const { id } = req.params;


    const updatedDesign = await Design.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!updatedDesign) {
        return next(new AppError("Design not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: { updatedDesign },
    });
});

export const deleteDesign = catchAsync(async (req, res, next) => {
    const deletedDesign = await Design.findByIdAndDelete(req.params.id);

    if (!deletedDesign) {
        return next(new AppError("Design not found", 404));
    }

    res.status(204).json({
        status: "success",
        data: null,
    });
});