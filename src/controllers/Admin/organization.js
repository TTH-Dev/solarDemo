import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import APIFeatures from "../../utils/ApiFeatures.js";
import Organization from "../../models/Admin/organization.js";
import Admin from "../../models/Admin/admin.js";

export const createOrganization = catchAsync(async (req, res, next) => {
    
    if (req.files) {
        if (req.files?.organizationLogo) {
            req.body.organizationLogo = req.files?.organizationLogo[0].filename;
        }
        if (req.files?.signatureDocument) {
            req.body.signatureDocument = req.files?.signatureDocument[0].filename;
        }
    }
    const adminId = req.admin._id;

    const organization = await Organization.create(req.body);

    await Admin.findByIdAndUpdate(
        adminId,
        { organizationId: organization._id },
        { new: true, runValidators: true }
    );

    res.status(201).json({
        status: "success",
        message: "Organization created successfully",
        data: { organization },
    });
});

export const getAllOrganizations = catchAsync(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

    const features = new APIFeatures(Organization.find(), req.query)
        .limitFields()
        .sort()
        .paginate();

    const organizations = await features.query;
    const totalRecords = await Organization.countDocuments();
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "success",
        totalPages,
        currentPage: page,
        result: organizations.length,
        data: { organizations },
    });
});

export const getOrganizationById = catchAsync(async (req, res, next) => {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
        return next(new AppError("Organization not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: { organization },
    });
});

export const updateOrganization = catchAsync(async (req, res, next) => {

    const {id} = req.params;

    if (req.files) {
        if (req.files?.organizationLogo) {
            req.body.organizationLogo = req.files?.organizationLogo[0].filename;
        }
        if (req.files?.signatureDocument) {
            req.body.signatureDocument = req.files?.signatureDocument[0].filename;
        }
    }
    const updatedOrganization = await Organization.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!updatedOrganization) {
        return next(new AppError("Organization not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: { updatedOrganization },
    });
});

export const deleteOrganization = catchAsync(async (req, res, next) => {
    const deletedOrganization = await Organization.findByIdAndDelete(req.params.id);

    if (!deletedOrganization) {
        return next(new AppError("Organization not found", 404));
    }

    res.status(204).json({
        status: "success",
        data: null,
    });
});