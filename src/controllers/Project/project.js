import Project from "../../models/Project/project.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import APIFeatures from "../../utils/ApiFeatures.js";
import User from "../../models/Members/User.js"
import Leads from "../../models/PreSales/leads.js";

export const getAllProject = catchAsync(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const { processStatus } = req.query;

    // Build filter object conditionally
    const filter = {};
    if (processStatus) {
        filter.processStatus = processStatus;
    }

    const features = new APIFeatures(
        Project.find()
            .populate("lead").populate("members").populate("team"),
        req.query
    )
        
        .sort()
        

    const projects = await features.query;
    const totalRecords = await Project.countDocuments();
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "success",
        totalPages,
        currentPage: page,
        result: projects.length,
        data: { projects },
    });
});
export const updateProject = catchAsync(async (req, res, next) => {
    const { processName, memberType, priority, startDate, dueDate } = req.body;
    const { id } = req.params;


    const data = {
        processName: processName,
        createdAt: Date.now()
    }
    const updatedProject = await Project.findByIdAndUpdate(
        id,
        { startDate, dueDate, memberType, priority, $push: { process: data } },
        {
            new: true,
            runValidators: true,
        }
    );

    if (!updatedProject) {
        return next(new AppError("Project not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: { updatedProject },
    });
});

export const deleteProjectProcess = catchAsync(async (req, res, next) => {
    const { delId } = req.body;
    const { id } = req.params;

    const updatedProject = await Project.findByIdAndUpdate(
        id,
        { $pull: { process: { _id: delId } } },
    );

    if (!updatedProject) {
        return next(new AppError("Project not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: { updatedProject },
    });
});

export const ProjectaddTeam = catchAsync(async (req, res, next) => {
    const { teamId, memberss } = req.body;
    const { id } = req.params;

    const updatedProject = await Project.findByIdAndUpdate(
        id,
        {
            members: memberss,
            team: teamId,
            membersAddedAt: new Date()
        },
        { new: true, runValidators: true }
    );


    if (!updatedProject) {
        return next(new AppError("Project not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: { updatedProject },
    });
});

export const getProjectById = catchAsync(async (req, res, next) => {
    const project = await Project.findById(req.params.id)
        .populate("lead").populate("members").populate("team");

    if (!project) {
        return next(new AppError("Project not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: { project },
    });
});


export const addSamplequatos = catchAsync(async (req, res, next) => {
    const { quotes, userId } = req.body;
    const { id } = req.params;


    const user = await User.findById(userId);

    const data = {
        quotes: quotes,
        addedBy: user.name,
        addedDate: Date.now()
    }

    const project = await Project.findByIdAndUpdate(
        id,
        { $push: { sampleQuotes: data } },
        { new: true, runValidators: true }
    );
    const lId = project.lead;

    const lead = await Leads.findByIdAndUpdate(
        lId,
        { $push: { sampleQuotes: data } },
        { new: true, runValidators: true }
    );
    if (!project) {
        return next(new AppError("Project not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: { project },
    });
});

export const addSolarInspection = catchAsync(async (req, res, next) => {
    const { id } = req.params;   // route param
    const { inspectionData } = req.body;

    const updatedProject = await Project.findByIdAndUpdate(
        id,
        { $set: { solarInspection: [inspectionData] } },  // overwrite with a single item array
        { new: true, runValidators: true }
    );

    if (!updatedProject) {
        return next(new AppError("Project not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: { updatedProject },
    });
});

export const addLicenseDocuments = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { documentName } = req.body;

    if (!req.files || !req.files.image) {
        return next(new AppError("No file uploaded", 400));
    }

    const filePath = `/images/${req.files.image[0].filename}`;

    const licenseDoc = {
        documentName,
        documentUrl: filePath,
    };

    const updatedProject = await Project.findByIdAndUpdate(
        id,
        { $push: { licenseDocuments: licenseDoc } },
        { new: true, runValidators: true }
    );

    if (!updatedProject) {
        return next(new AppError("Project not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: { updatedProject },
    });
});

export const updateProjectStatus = catchAsync(async (req, res, next) => {
    const { projectId: id } = req.query;
    const { processStatus } = req.body;

    if (!processStatus) {
        return next(new AppError("processStatus is required", 400));
    }

    const project = await Project.findById(id);

    if (!project) {
        return next(new AppError("Project not found", 404));
    }

    project.processStatus = processStatus;
    const updatedProject = await project.save();

    res.status(200).json({
        status: "success",
        data: { updatedProject },
    });
});
