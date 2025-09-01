import ProjectForcasting from "../../models/Finance Analysis/projectForcasting.js";
import User from "../../models/Members/User.js";
import Admin from "../../models/Admin/admin.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import APIFeatures from "../../utils/ApiFeatures.js";
import Leads from "../../models/PreSales/leads.js";

export const createProjectForcasting = catchAsync(async (req, res, next) => {
    const { leadId, estimateProjectValye, total, userId } = req.body;

    let user = await User.findById(userId);
    if (!user) {
        user = await Admin.findById(userId);
    }

    const newData = {
        lead: leadId,
        estimateProjectValye,
        total,
        addedBy: user.name,
        addedDate: Date.now()
    };

    const project = await ProjectForcasting.create(newData);

    await Leads.findByIdAndUpdate(leadId, { $push: { projectForcasting: project._id } });

    res.status(200).json({
        status: "success",
        data: {
            project
        }
    });
});

export const getAllProjectForcasting = catchAsync(async (req, res, next) => {
    const limit = req.query.limit || 10;
    const page = req.query.page || 1;

    const filter = {};
    if (req.query.lead) {
        filter.lead = req.query.lead;
    }

    const features = new APIFeatures(ProjectForcasting.find(filter).populate("lead"), req.query)
        .limitFields()
        .sort()
        .paginate();

    const forecasts = await features.query;
    const totalRecords = await ProjectForcasting.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "success",
        totalPages,
        currentPage: page,
        result: forecasts.length,
        data: {
            forecasts
        }
    });
});

export const getProjectForcastingById = catchAsync(async (req, res, next) => {
    const forecast = await ProjectForcasting.findById(req.params.id).populate("lead");

    if (!forecast) {
        return next(new AppError("Forecast not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            forecast
        }
    });
});

export const updateProjectForcasting = catchAsync(async (req, res, next) => {
    const updated = await ProjectForcasting.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!updated) {
        return next(new AppError("Forecast not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            updated
        }
    });
});

export const deleteProjectForcasting = catchAsync(async (req, res, next) => {
    const deleted = await ProjectForcasting.findByIdAndDelete(req.params.id);

    if (!deleted) {
        return next(new AppError("Forecast not found", 404));
    }

    res.status(204).json({
        status: "success",
        data: null
    });
});
