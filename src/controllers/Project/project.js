import Project from "../../models/Project/project.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import APIFeatures from "../../utils/ApiFeatures.js";
import User from "../../models/Members/User.js"
import Leads from "../../models/PreSales/leads.js";
import Admin from "../../models/Admin/admin.js";

// export const getAllProject = catchAsync(async (req, res, next) => {
//     const limit = parseInt(req.query.limit) || 15;
//     const page = parseInt(req.query.page) || 1;
//     const { processStatus , companyName, phoneNo } = req.query;
//     const filter = {};
//     if (processStatus) {
//         if (processStatus === "excludeCompleted") {
//             filter.processStatus = { $ne: "completed" };
//         } else {
//             filter.processStatus = processStatus;
//         }
//     }
//     const features = new APIFeatures(
//         Project
//             .find(filter)
//             .sort("-createdAt")
//             .populate("lead")
//             .populate("members")
//             .populate("team")
//             .limit(limit)
//             .skip((page - 1) * limit),
//         req.query)
//     const totalRecords = await Project.countDocuments(filter);
//     const projects = await features.query;
//     const totalPages = Math.ceil(totalRecords / limit);

//     res.status(200).json({
//         status: "success",
//         totalPages,
//         currentPage: page,
//         result: projects.length,
//         data: { projects },
//     });
// });

export const getAllProject = catchAsync(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 15;
    const page = parseInt(req.query.page) || 1;
    const { processStatus, companyName, phoneNo } = req.query;

    const filter = {};

    // ✅ Filter by process status
    if (processStatus) {
        if (processStatus === "excludeCompleted") {
            filter.processStatus = { $ne: "completed" };
        } else {
            filter.processStatus = processStatus;
        }
    }

    // ✅ Start building base query
    let query = Project.find(filter)
        .sort("-createdAt")
        .populate({
            path: "lead",
            match: {
                ...(companyName ? { companyName: { $regex: companyName, $options: "i" } } : {}),
                ...(phoneNo ? { phoneNo: { $in: [phoneNo] } } : {}) // phoneNo is an array
            }
        })
        .populate("members")
        .populate("team")
        .limit(limit)
        .skip((page - 1) * limit);

    const features = new APIFeatures(query, req.query);

    const allProjects = await features.query;

    // ✅ Remove projects with no matched lead if lead filter was applied
    const filteredProjects = (companyName || phoneNo)
        ? allProjects.filter(project => project.lead !== null)
        : allProjects;

    const totalRecords = filteredProjects.length;
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "success",
        totalPages,
        currentPage: page,
        result: filteredProjects.length,
        data: {
            projects: filteredProjects,
        },
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


    const user = await User.findById(userId) || await Admin.findById(userId);

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
    const { id } = req.params;
    const { inspectionData } = req.body;

    const updatedProject = await Project.findByIdAndUpdate(
        id,
        { $set: { solarInspection: [inspectionData] } },
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
