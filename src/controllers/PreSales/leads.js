import Leads from "../../models/PreSales/leads.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import APIFeatures from "../../utils/ApiFeatures.js";
import User from "../../models/Members/User.js";
import XLSX from "xlsx";
import Customer from "../../models/Customer/customer.js";
import History from "../../models/PreSales/history.js";
import Admin from "../../models/Admin/admin.js";
import Project from "../../models/Project/project.js";
import dayjs from "dayjs";
import Dchallan from "../../models/PreSales/dchallan.js";
import Schedule from "../../models/Inventory/Schedule.js";
import { normalize } from "path";
import Product from "../../models/Inventory/products.js";
import mongoose from "mongoose";
import BOM from "../../models/PreSales/bom.js";
import Quation from "../../models/PreSales/quation.js";

export const createLeads = catchAsync(async (req, res, next) => {
  const { name, email, phoneNo, assignedTo, leadSourceType, } = req.body;

  const leadData = {
    name: name,
    email: Array.isArray(email) ? email : [email],
    phoneNo: Array.isArray(phoneNo) ? phoneNo : [phoneNo],
    companyName: req.body.companyName,
    leadSource: req.body.leadSource,
    leadSourceType,
    assignedTo: assignedTo,
  };
  const lead = await Leads.create(leadData);

  const user = await User.findByIdAndUpdate(
    assignedTo,
    {
      $push: { lead: lead._id },
    },
    { new: true }
  );

  res.status(200).json({
    status: "Success",
    data: {
      lead,
      user,
    },
  });
});

export const getAllLeadss = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 20;
  const page = parseInt(req.query.page) || 1;

  let filter = {};
  if (req.query.status) {
    filter.status = req.query.status;
  }
  if (req.query.name) {
    filter.name = req.query.name;
  }
  if (req.query.email) {
    filter.email = req.query.email;
  }
  if (req.query.section) {
    filter[req.query.section] = { $ne: null };
  }
  if (req.query.siteName) {
    filter["siteDetails.siteName"] = req.query.siteName;
  }

  if (req.query.isWon) {
    filter.isWon = req.query.isWon;
  }
   if (req.query.leadWonStatus) {
    filter.leadWonStatus = req.query.leadWonStatus;
  }
  if (req.query.leadSource) {
    filter.leadSource = req.query.leadSource;
  }
  if (req.query.leadSourceType) {
    filter.leadSourceType = req.query.leadSourceType;
  }
  if (req.query.projectProcessStatus) {
    filter.projectProcessStatus = req.query.projectProcessStatus;
  }
   if (req.query.preSalesPerson === "") {
    filter.preSalesPerson = req.query.preSalesPerson;
  }
  if (req.query.preSalesPersonEmpty === "true") {
  filter.preSalesPerson = { $in: [null, ""] };
} else if (req.query.preSalesPersonAssigned === "true") {
  filter.preSalesPerson = { $ne: null };
}
 if (req.query.preSalesPersonAssigned === "false") {
  filter.preSalesPerson = { $in: null };
}

  if (!req.query.sort) {
  req.query.sort = '-createdAt';
}

  const features = new APIFeatures(
    Leads.find(filter)
      .populate("assignedTo")
      .populate("preSalesPerson")
      .populate("purchasesPerson")
      .populate("financeAnalysisPerson")
      .populate("procurementPerson")
      .populate("storePerson")
      .populate("projectPerson")
      .populate("designPerson"),
    req.query
  )
    .limitFields()
    .sort()
    .paginate();

  const leads = await features.query;
  const totalRecords = await Leads.countDocuments(filter);
  const totalPages = Math.ceil(totalRecords / limit);
  const nameDm = await Leads.distinct("name");
  const emailDm = await Leads.distinct("email");
  const leadSourceDm = await Leads.distinct("leadSource");
  const leadSourceTypeDm = await Leads.distinct("leadSourceType");

  res.status(200).json({
    status: "success",
    totalPages,
    currentPage: page,
    result: leads.length,
    data: {
      emailDm, nameDm, leadSourceDm,
      leadSourceTypeDm, leads
    },
  });
});

export const getLeadsById = catchAsync(async (req, res, next) => {
  const teamDoc = await Leads.findById(req.params.id)
    .populate("assignedTo")
    .populate("preSalesPerson")
    .populate("purchasesPerson")
    .populate("financeAnalysisPerson")
    .populate("procurementPerson")
    .populate("storePerson")
    .populate("projectPerson")
    .populate("designPerson")
    .populate({
      path: "bom.bomId",
      populate: {
        path: "costedBom",
      }
    })
    .populate({
      path: "coastedBom.coastedBomId",
    });

  if (!teamDoc) {
    return next(new AppError("Leads not found", 404));
  }
  const team = teamDoc.toObject();

  // Normalize email and phoneNo to arrays
  const normalized = {
    ...team,
    email: team.email
      ? Array.isArray(team.email)
        ? team.email
        : [team.email]
      : [],
    phoneNo: team.phoneNo
      ? Array.isArray(team.phoneNo)
        ? team.phoneNo
        : [team.phoneNo]
      : [],
  };
  res.status(200).json({
    status: "success",
    data: { team: normalized },
  });
});
export const updateProjectProcessStatus = catchAsync(async (req, res, next) => {
  const { lead, projectProcessStatus } = req.body;

  if (!lead || !projectProcessStatus) {
    return next(new AppError("Both 'lead' and 'projectProcessStatus' are required", 400));
  }

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(lead)) {
    return next(new AppError("Invalid lead ID", 400));
  }

  const updatedLead = await Leads.findByIdAndUpdate(
    lead,
    { projectProcessStatus },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedLead) {
    return next(new AppError("No lead found with this ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: updatedLead,
  });
});

export const updateLeads = catchAsync(async (req, res, next) => {
  const { siteName, qualifiedDate, userId, siteVisitDetails, freeAreaAvailableOnGround, expectedDateOfInstallation, freeAreaAvailableOnRoof } = req.body;
  const { id } = req.params;

  let updatedLeads;

  if (siteName) {
    let siteDetails = {
      siteName: req.body.siteName,
      freeAreaAvailableOnRoof: req.body.freeAreaAvailableOnRoof,
      freeAreaAvailableOnGround: req.body.freeAreaAvailableOnGround,
      expectedDateOfInstallation: req.body.expectedDateOfInstallation,
      siteLocation: req.body.siteLocation,
      specificInfo: req.body.specificInfo,
      googleLocationOrCoordinates: req.body.googleLocationOrCoordinates,
      clientInput: req.body.clientInput,
      scheduleDate: req.body.scheduleDate,
      scheduleTime: req.body.scheduleTime,
    };

    if (req.files?.siteImage) {
      siteDetails.siteImage = req.files.siteImage[0].filename;
    }

    updatedLeads = await Leads.findByIdAndUpdate(
      id,
      { siteDetails, status: "interested", qualifiedDate: qualifiedDate },
      {
        new: true,
        runValidators: true,
      }
    );

    const cData = {
      lead: updatedLeads._id,
      companyName: updatedLeads.companyName,
      phoneNo: Array.isArray(updatedLeads.phoneNo) ? updatedLeads.phoneNo : [updatedLeads.phoneNo],
      email: Array.isArray(updatedLeads.email) ? updatedLeads.email : [updatedLeads.email],
      contactName: updatedLeads.name,
    };
    const customer = await Customer.create(cData);
  } else if (siteVisitDetails) {
    const user = await User.findById(userId);

    const data = {
      // addedBy: user.name,
      addedDate: Date.now(),
      latitude: siteVisitDetails.latitude,
      longitude: siteVisitDetails.longitude,
      typeOfSolution: siteVisitDetails.typeOfSolution,
      expectedDateOfInstallation: siteVisitDetails.expectedDateOfInstallation,
      notes: siteVisitDetails.notes,
      freeAreaAvailableOnRoof: siteVisitDetails.freeAreaAvailableOnRoof,
      freeAreaAvailableOnGround: siteVisitDetails.freeAreaAvailableOnGround,
      roofType: siteVisitDetails.roofType,
      roofAngle: siteVisitDetails.roofAngle,
    };

    updatedLeads = await Leads.findByIdAndUpdate(
      id,
      { siteVisitDetails: data },
      {
        new: true,
        runValidators: true,
      }
    );
  } else {
    updatedLeads = await Leads.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
  }

  if (!updatedLeads) {
    return next(new AppError("Leads not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { updatedLeads },
  });
});

export const deleteLeads = catchAsync(async (req, res, next) => {
  const deletedLeads = await Leads.findByIdAndDelete(req.params.id);

  if (!deletedLeads) {
    return next(new AppError("Leads not found", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

export const importLeadsFromExcel = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("No file uploaded!", 400));
  }

  const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  const leadManagers = await User.find({ role: "leadManage" });

  if (!leadManagers.length) {
    return res.status(400).json({
      status: "fail",
      message: "No users with lead management permission found.",
    });
  }

  const createdLeads = [];
  let userIndex = 0;

  for (const leadRow of rows) {
    const assignedUser = leadManagers[userIndex];
    const leadData = {
      name: leadRow.name,
      email: leadRow.email,
      phoneNo: leadRow.phoneNo,
      companyName: leadRow.companyName,
      leadSource: leadRow.leadSource,
      assignedTo: assignedUser._id,
    };

    const lead = await Leads.create(leadData);

    await User.findByIdAndUpdate(assignedUser._id, {
      $push: { lead: lead._id },
    });

    createdLeads.push(lead);

    userIndex = (userIndex + 1) % leadManagers.length;
  }

  res.status(200).json({
    status: "success",
    totalLeadsCreated: createdLeads.length,
    data: createdLeads,
  });
});

// export const addLeadNotes = catchAsync(async (req, res, next) => {
//   const { note, userId } = req.body;
//   const { id } = req.params;

//   const user = await User.findById(userId);

//   if (!user) {
//     return next(new AppError("User Not Found!", 404));
//   }
//   const data = {
//     text: note,
//     addedBy: user.name,
//     addedDate: Date.now(),
//   };
//   const lead = await Leads.findByIdAndUpdate(
//     id,
//     { $push: { notes: data } },
//     { new: true }
//   );

//   if (!lead) {
//     return next(new AppError("Lead Not Found!", 404));
//   }

//   res.status(200).json({
//     status: "Success",
//     data: {
//       lead,
//     },
//   });
// });

export const addLeadNotes = catchAsync(async (req, res, next) => {
  const { note, userId, recipientIds } = req.body;
  const { id } = req.params;

  const user = await User.findById(userId);
  if (!user) return next(new AppError("User Not Found!", 404));

  let visibleTo = [];
  let visibleToAll = false;

  if (recipientIds && recipientIds.length > 0) {
    if (recipientIds.includes("all")) {
      visibleToAll = true;
      visibleTo = [];
    } else {
      // Always include the creator
      visibleTo = Array.from(new Set([...recipientIds, userId]));
      visibleToAll = false;
    }
  } else {
    // If no one selected, default to all users
    visibleToAll = true;
    visibleTo = [];
  }

  const data = {
    text: note,
    addedBy: user.name,
    addedDate: Date.now(),
    visibleToAll,
    visibleTo,
  };

  const lead = await Leads.findByIdAndUpdate(
    id,
    { $push: { notes: data } },
    { new: true }
  );
  
  if (!lead) return next(new AppError("Lead Not Found!", 404));

  res.status(200).json({
    status: "Success",
    data: { lead },
  });
});



export const removeLeadNotes = catchAsync(async (req, res, next) => {
  const { delId } = req.body;
  const { id } = req.params;

  const lead = await Leads.findByIdAndUpdate(
    id,
    { $pull: { notes: { _id: delId } } },
    { new: true }
  );

  if (!lead) {
    return next(new AppError("Lead Not Found!", 404));
  }

  res.status(200).json({
    status: "Success",
    data: {
      lead,
    },
  });
});

export const addLeadFiles = catchAsync(async (req, res, next) => {
  const { userId } = req.body;
  const { id } = req.params;

  let data = {};

  const user = await User.findById(userId);

  if (req.files) {
    if (req.files.file) {
      data.files = req.files.file[0].filename;
      data.fileName = req.files.file[0].originalname;
    }
  }

  if (!user) {
    return next(new AppError("User Not Found!", 404));
  }

  data.addedBy = user.name;
  data.addedDate = Date.now();

  const lead = await Leads.findByIdAndUpdate(
    id,
    { $push: { files: data } },
    { new: true }
  );

  if (!lead) {
    return next(new AppError("Lead Not Found!", 404));
  }

  res.status(200).json({
    status: "Success",
    data: {
      lead,
    },
  });
});

export const editLeadFiles = catchAsync(async (req, res, next) => {
  const { userId } = req.body;
  const { id } = req.params;
  const { fileId } = req.query;

  let data = {};

  const user = await User.findById(userId);

  if (req.files) {
    if (req.files.file) {
      data.files = req.files.file[0].filename;
      data.fileName = req.files.file[0].originalname;
    }
  }

  if (!user) {
    return next(new AppError("User Not Found!", 404));
  }

  data.addedBy = user.name;
  data.addedDate = Date.now();

  const lead = await Leads.findOneAndUpdate(
    { _id: id, "files._id": fileId },
    { $set: { "files.$": data } },
    { new: true }
  );

  if (!lead) {
    return next(new AppError("Lead Not Found!", 404));
  }

  res.status(200).json({
    status: "Success",
    data: {
      lead,
    },
  });
});

export const removeLeadFiles = catchAsync(async (req, res, next) => {
  const { delId } = req.body;
  const { id } = req.params;

  const lead = await Leads.findByIdAndUpdate(
    id,
    { $pull: { files: { _id: delId } } },
    { new: true }
  );

  if (!lead) {
    return next(new AppError("Lead Not Found!", 404));
  }

  res.status(200).json({
    status: "Success",
    data: {
      lead,
    },
  });
});

export const addLeadSiteNotes = catchAsync(async (req, res, next) => {
  const { note, userId } = req.body;
  const { id } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    return next(new AppError("User Not Found!", 404));
  }
  const data = {
    text: note,
    addedBy: user.name,
    addedDate: Date.now(),
  };
  const lead = await Leads.findByIdAndUpdate(
    id,
    { $push: { siteNotes: data } },
    { new: true }
  );

  if (!lead) {
    return next(new AppError("Lead Not Found!", 404));
  }

  res.status(200).json({
    status: "Success",
    data: {
      lead,
    },
  });
});

export const removeLeadSiteNotes = catchAsync(async (req, res, next) => {
  const { delId } = req.body;
  const { id } = req.params;

  const lead = await Leads.findByIdAndUpdate(
    id,
    { $pull: { siteNotes: { _id: delId } } },
    { new: true }
  );

  if (!lead) {
    return next(new AppError("Lead Not Found!", 404));
  }

  res.status(200).json({
    status: "Success",
    data: {
      lead,
    },
  });
});

export const addLeadSiteFiles = catchAsync(async (req, res, next) => {
  const { userId } = req.body;
  const { id } = req.params;
  let data = {};

  const user = await User.findById(userId);

  if (req.files) {
    if (req.files.file) {
      data.files = req.files.file[0].filename;
      data.fileName = req.files.file[0].originalname;
    }
  }

  if (!user) {
    return next(new AppError("User Not Found!", 404));
  }

  data.addedBy = user.name;
  data.addedDate = Date.now();

  const lead = await Leads.findByIdAndUpdate(
    id,
    { $push: { siteFiles: data } },
    { new: true }
  );

  if (!lead) {
    return next(new AppError("Lead Not Found!", 404));
  }

  res.status(200).json({
    status: "Success",
    data: {
      lead,
    },
  });
});

export const editLeadSiteFiles = catchAsync(async (req, res, next) => {
  const { userId } = req.body;
  const { id } = req.params;
  const { fileId } = req.query;

  let data = {};

  const user = await User.findById(userId);

  if (req.files) {
    if (req.files.file) {
      data.files = req.files.file[0].filename;
      data.fileName = req.files.file[0].originalname;
    }
  }

  if (!user) {
    return next(new AppError("User Not Found!", 404));
  }

  data.addedBy = user.name;
  data.addedDate = Date.now();

  const lead = await Leads.findOneAndUpdate(
    { _id: id, "siteFiles._id": fileId },
    { $set: { "siteFiles.$": data } },
    { new: true }
  );

  if (!lead) {
    return next(new AppError("Lead Not Found!", 404));
  }

  res.status(200).json({
    status: "Success",
    data: {
      lead,
    },
  });
});
export const removeLeadSiteFiles = catchAsync(async (req, res, next) => {
  const { delId } = req.body;
  const { id } = req.params;

  const lead = await Leads.findByIdAndUpdate(
    id,
    { $pull: { siteFiles: { _id: delId } } },
    { new: true }
  );

  if (!lead) {
    return next(new AppError("Lead Not Found!", 404));
  }

  res.status(200).json({
    status: "Success",
    data: {
      lead,
    },
  });
});

export const addLeadDesignFiles = catchAsync(async (req, res, next) => {
  const { userId } = req.body;
  const { id } = req.params;

  let data = {};
  let user = await User.findById(userId);
  if (!user) {
    user = await Admin.findById(userId);
  }
  if (req.files) {
    if (req.files.file) {
      (data.files = req.files.file[0].filename),
        (data.fileName = req.files.file[0].originalname);
    }
  }
  if (!user) {
    return next(new AppError("User Not Found!", 404));
  }
  data.addedBy = user.name;
  data.addedDate = Date.now();
  const lead = await Leads.findByIdAndUpdate(
    id,
    { $push: { designFiles: data } },
    { new: true }
  );

  if (!lead) {
    return next(new AppError("Lead Not Found!", 404));
  }
  res.status(200).json({
    status: "Success",
    data: {
      lead,
    },
  });
});

export const editLeadDesignFiles = catchAsync(async (req, res, next) => {
  const { userId } = req.body;
  const { id } = req.params;

  const { fileId } = req.query;

  let data = {};
  let user = await User.findById(userId);

  if (!user) {
    user = await Admin.findById(userId);
  }

  if (req.files) {
    if (req.files.file) {
      (data.files = req.files.file[0].filename),
        (data.fileName = req.files.file[0].originalname);
    }
  }
  if (!user) {
    return next(new AppError("User Not Found!", 404));
  }
  data.addedBy = user.name;
  data.addedDate = Date.now();

  const lead = await Leads.findOneAndUpdate(
    { _id: id, "designFiles._id": fileId },
    { $set: { "designFiles.$": data } },
    { new: true }
  );
  if (!lead) {
    return next(new AppError("Lead Not Found!", 404));
  }
  res.status(200).json({
    status: "Success",
    data: {
      lead,
    },
  });
});

export const removeLeadDesignFiles = catchAsync(async (req, res, next) => {
  const { delId } = req.body;
  const { id } = req.params;

  const lead = await Leads.findByIdAndUpdate(
    id,
    { $pull: { designFiles: { _id: delId } } },
    { new: true }
  );

  if (!lead) {
    return next(new AppError("Lead Not Found!", 404));
  }

  res.status(200).json({
    status: "Success",
    data: {
      lead,
    },
  });
});

export const updateModuleStatus = catchAsync(async (req, res, next) => {
  const {
    salesStatus,
    designStatus,
    purchaseStatus,
    procurementStatus,
    storeStatus,
    historyFor,
    processName,
  } = req.body;
  const { id } = req.params;

  let updatedLeads;

  updatedLeads = await Leads.findByIdAndUpdate(
    id,
    {
      salesStatus,
      designStatus,
      purchaseStatus,
      procurementStatus,
      storeStatus,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  const user = req.user;
  const htDate = {
    historyFor,
    processName,
    finishDate: Date.now(),
    finishedBy: user.name,
  };
  if (!updatedLeads.history) {
    const history = await History.create(htDate);
  } else {
    const history = await History.create(htDate);
  }

  if (!updatedLeads) {
    return next(new AppError("Leads not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { updatedLeads },
  });
});

export const getSalesWonChange = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { leadWonStatus } = req.body;

  const lead = await Leads.findByIdAndUpdate(
    id,
    { leadWonStatus: leadWonStatus },
    { new: true, runValidators: true }
  );

  const data = {
    name: lead.siteDetails.siteName,
    lead: lead._id,
  };

  if (leadWonStatus == "won") {
    const project = await Project.create(data);
  }

  res.status(200).json({
    status: "success",
    data: { lead },
  });
});

export const getAllAttachments = catchAsync(async (req, res) => {
  const { id } = req.params;

  const lead = await Leads.findById(id).lean();

  if (!lead) {
    return res.status(404).json({ message: "Lead not found" });
  }

  const allFiles = [
    ...(lead.files || []),
    ...(lead.siteFiles || []),
    ...(lead.designFiles || []),
  ];

  res.status(200).json({
    success: true,
    totalFiles: allFiles.length,
    files: allFiles,
  });
});

export const updateEstimateValuesByName = catchAsync(async (req, res, next) => {
  const { leadId } = req.params;
  const { updatedEstimates } = req.body;

  const lead = await Leads.findById(leadId);
  if (!lead) {
    return next(new AppError("Lead not found", 404));
  }

  const estimates = lead.estimateProjectValye || [];
  const extraMaterials = lead.extraMaterials || [];

  updatedEstimates.forEach((update) => {
    const estimateIndex = estimates.findIndex(
      (item) => item.name === update.name
    );
    if (estimateIndex > -1) {
      estimates[estimateIndex].amount =
        (estimates[estimateIndex].amount || 0) + (update.amount || 0);
      if (update.expDate) estimates[estimateIndex].expDate = update.expDate;
    } else {
      estimates.push({
        name: update.name,
        amount: update.amount || 0,
        expDate: update.expDate || null,
      });
    }

    extraMaterials.push({
      name: update.name,
      amount: update.amount || 0,
      expDate: update.expDate || null,
      totalAmount: update.amount || 0,
      createdAt: new Date(),
    });
  });

  lead.estimateProjectValye = estimates;
  lead.extraMaterials = extraMaterials;

  await lead.save();

  res.status(200).json({
    status: "success",
    data: {
      estimateProjectValye: lead.estimateProjectValye,
      extraMaterials: lead.extraMaterials,
    },
  });
});

export const addICHistory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req.body;

  let user = await User.findById(userId)
  if (!user) {
    user = await Admin.findById(userId)
  }


  const data = {
    checkBy: user.name,
    checkedDate: Date.now(),
  };

  const lead = await Leads.findByIdAndUpdate(
    id,
    { $push: { inventoryChckHistory: data } },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: "success",
    data: { lead },
  });
});
export const addCAHistory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req.body;

  const user = await User.findById(userId);

  const data = {
    checkBy: user.name,
    checkedDate: Date.now(),
  };

  const lead = await Leads.findByIdAndUpdate(
    id,
    { $push: { costAnalysisChckHistory: data } },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: "success",
    data: { lead },
  });
});

export const addSamplequatos = catchAsync(async (req, res, next) => {
  const { quotes, userId } = req.body;
  const { id } = req.params;

  const user = await User.findById(userId);

  const data = {
    quotes: quotes,
    // addedBy: user.name,
    addedDate: Date.now(),
  };
  const lead = await Leads.findByIdAndUpdate(
    id,
    { $push: { sampleQuotes: data } },
    { new: true, runValidators: true }
  );
  if (!lead) {
    return next(new AppError("lead not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { lead },
  });
});

export const addRecordRecipt = catchAsync(async (req, res, next) => {
  const { userId, paymentMode, receivedAmount, recivedDate } = req.body;
  const { id } = req.params;

  const user = await User.findById(userId);
  if (!user) return next(new AppError("User not found", 404));

  const lead = await Leads.findById(id);
  if (!lead) return next(new AppError("Lead not found", 404));

  const data = {
    paymentMode,
    receivedAmount,
    recivedDate,
    addedBy: user.name,
  };

  const newBalance = (lead.balanceAmount || 0) - receivedAmount;

  const updatedLead = await Leads.findByIdAndUpdate(
    id,
    {
      $push: { recordReceipt: data },
      $set: { balanceAmount: newBalance },
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: "success",
    data: { lead: updatedLead },
  });
});

export const addDelverySchedudule = catchAsync(async (req, res, next) => {
  const { userId } = req.body;
  const { id } = req.params;

  let datas = {};

  if (req.files && req.files.deliveryChallan) {
    datas.deliveryChallan = req.files.deliveryChallan[0].filename;
  }

  const user = await User.findById(userId);

  const data = {
    addressLine1: req.body.addressLine1,
    addressLine2: req.body.addressLine2,
    city: req.body.city,
    state: req.body.state,
    pinCode: req.body.pinCode,
    date: req.body.date,
    time: req.body.time,
    notes: req.body.notes,
    addedBy: user.name,
    addedDate: Date.now(),
    deliveryChallan: datas.deliveryChallan,
  };

  const lead = await Leads.findByIdAndUpdate(
    id,
    { $push: { deliverySchedule: data } },
    { new: true, runValidators: true }
  );
  if (!lead) {
    return next(new AppError("lead not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { lead },
  });
});

export const addTaskActivity = catchAsync(async (req, res, next) => {
  const { leadId } = req.params;
  const {
    module,
    processName,
    userId,
    salesStatus,
    designStatus,
    purchaseStatus,
    procurementStatus,
    storeStatus,
  } = req.body;

  const lead = await Leads.findById(leadId);
  if (!lead) {
    return next(new AppError("Lead not found", 404));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Create new activity entry
  const newActivity = {
    processName,
    completedBy: user.name,
    completedAt: new Date(),
  };

  // Ensure taskActivities object exists
  if (!lead.taskActivities || typeof lead.taskActivities !== "object") {
    lead.taskActivities = {};
  }

  // Initialize module array if not present
  if (!Array.isArray(lead.taskActivities[module])) {
    lead.taskActivities[module] = [];
  }

  // Push new activity
  lead.taskActivities[module].push(newActivity);

  // Conditionally update statuses if provided
  if (salesStatus !== undefined) lead.salesStatus = salesStatus;
  if (designStatus !== undefined) lead.designStatus = designStatus;
  if (purchaseStatus !== undefined) lead.purchaseStatus = purchaseStatus;
  if (procurementStatus !== undefined)
    lead.procurementStatus = procurementStatus;
  if (storeStatus !== undefined) lead.storeStatus = storeStatus;

  await lead.save();

  res.status(200).json({
    status: "success",
    message: `Activity added to module: ${module}`,
    data: newActivity,
  });
});

export const homeData = catchAsync(async (req, res) => {
  const filter = {};

  // if (req.query.status) {
  //   filter.status = req.query.status;
  // }

  // if (req.query.roofType) {
  //   filter["siteVisitDetails.roofType"] = req.query.roofType;
  // }

  if (req.query.date) {
    const start = dayjs(req.query.date).startOf("day").toDate();
    const end = dayjs(req.query.date).endOf("day").toDate();

    filter.updatedAt = { $gte: start, $lte: end };
  }

  const data = await Leads.find(filter);

  const counts = {
    totalLeads: data.length,
    leadsWithQuotation: data.filter((lead) => lead.quatation?.length > 0)
      .length,
    leadsWithSiteVisitDetails: data.filter(
      (lead) =>
        lead.siteVisitDetails?.typeOfSolution || lead.siteVisitDetails?.roofType
    ).length,
    leadwithQualified: data.filter((lead) => lead?.status === "qualified")
      .length,
    leadwithLost: data.filter((lead) => lead?.status === "lost-leads").length,
  };

  res.status(200).json({
    status: "success",
    counts,
  });
});

export const updateQuotationStatus = catchAsync(async (req, res, next) => {
  const { leadId, quotationId, status } = req.body;

  if (!leadId || !quotationId || !status) {
    return next(new AppError("leadId, quotationId and status are required", 400));
  }

  if (!mongoose.Types.ObjectId.isValid(leadId) || !mongoose.Types.ObjectId.isValid(quotationId)) {
    return next(new AppError("Invalid leadId or quotationId", 400));
  }

  const lead = await Leads.findById(leadId);
  if (!lead) {
    return next(new AppError("Lead not found", 404));
  }

  const quotationEntry = lead.quatation.find(q => q.quatationId.toString() === quotationId);
  if (!quotationEntry) {
    return next(new AppError("Quotation not found in lead", 404));
  }

  // If status is approved, set other approved to pending/rejected
  if (status.toLowerCase() === "approved") {
    for (const q of lead.quatation) {
      if (q.quatationId.toString() !== quotationId && q.status?.toLowerCase() === "approved") {
        q.status = "pending";
        q.addedDate = new Date();

        await Quation.findByIdAndUpdate(q.quatationId, { quationStatus: "pending" });
      }
    }
    quotationEntry.status = status;
    quotationEntry.addedDate = new Date();

    const quationDoc = await Quation.findById(quotationId);
    if (!quationDoc) return next(new AppError("Quotation document not found", 404));
    quationDoc.quationStatus = status;
    await quationDoc.save();

    lead.balanceAmount = quationDoc.total || 0;

  } else if (status.toLowerCase() === "rejected") {
    // Reject current quotation
    quotationEntry.status = status;
    // quotationEntry.addedDate = new Date();

    const quationDoc = await Quation.findById(quotationId);
    if (!quationDoc) return next(new AppError("Quotation document not found", 404));
    quationDoc.quationStatus = status;
    await quationDoc.save();

    // Check if any other quotations are approved
    const approvedQuatations = lead.quatation.filter(q => q.status?.toLowerCase() === "approved");

    if (approvedQuatations.length > 0) {
      // Pick the first approved quotation's total for balanceAmount
      const approvedQuatationDoc = await Quation.findById(approvedQuatations[0].quatationId);
      lead.balanceAmount = approvedQuatationDoc?.total || 0;
    } else {
      // No more approved quotations, set balanceAmount to 0
      lead.balanceAmount = 0;
    }
  } else {
    // For other statuses just update quotation and Quation doc status
    quotationEntry.status = status;
    // quotationEntry.addedDate = new Date();

    const quationDoc = await Quation.findById(quotationId);
    if (!quationDoc) return next(new AppError("Quotation document not found", 404));
    quationDoc.quationStatus = status;
    await quationDoc.save();
  }

  await lead.save();

  return res.status(200).json({
    status: "success",
    message: `Quotation status updated to '${status}'.`,
    data: {
      leadId,
      quotationId,
      status,
      balanceAmount: lead.balanceAmount,
    },
  });
});

// export const updateScheduleStatus = catchAsync(async (req, res, next) => {
//   const { scheduleId, status } = req.body;

//   if (!scheduleId || !mongoose.Types.ObjectId.isValid(scheduleId)) {
//     return next(new AppError("Invalid or missing scheduleId", 400));
//   }

//   const validStatuses = ["pending", "dispatched", "delivered"];
//   if (!status || !validStatuses.includes(status.toLowerCase())) {
//     return next(new AppError(`Status must be one of: ${validStatuses.join(", ")}`, 400));
//   }

//   const schedule = await Schedule.findById(scheduleId);
//   if (!schedule) {
//     return next(new AppError("Schedule not found", 404));
//   }

//   schedule.status = status.toLowerCase();
//   await schedule.save();

//   res.status(200).json({
//     status: "success",
//     message: `Schedule status updated to '${status}'`,
//     data: schedule,
//   });
// });

export const updateScheduleStatus = catchAsync(async (req, res, next) => {
  const { scheduleId, status } = req.body;

  if (!scheduleId || !mongoose.Types.ObjectId.isValid(scheduleId)) {
    return next(new AppError("Invalid or missing scheduleId", 400));
  }

  const validStatuses = ["pending", "dispatched", "delivered"];
  if (!status || !validStatuses.includes(status.toLowerCase())) {
    return next(new AppError(`Status must be one of: ${validStatuses.join(", ")}`, 400));
  }

  const schedule = await Schedule.findById(scheduleId);
  if (!schedule) {
    return next(new AppError("Schedule not found", 404));
  }

  schedule.status = status.toLowerCase();
  await schedule.save();

  // Also update the related Delivery Challan's status if there is an associated deliveryChallan
  if (schedule.deliveryChallan) {
    const deliveryChallan = await Dchallan.findById(schedule.deliveryChallan);
    if (deliveryChallan) {
      deliveryChallan.status = status.toLowerCase();
      await deliveryChallan.save();
    }
  }

  res.status(200).json({
    status: "success",
    message: `Schedule status updated to '${status}' and related Delivery Challan status updated`,
    data: schedule,
  });
});

export const homeDataTable = catchAsync(async (req, res) => {
  const filter = {};

  if (req.query.section && req.query.date) {
    filter.section = req.query.design;
    const start = dayjs(req.query.date).startOf("day").toDate();
    const end = dayjs(req.query.date).endOf("day").toDate();
    filter["designerSiteVisitDetails.scheduleDate"] = {
      $gte: start,
      $lte: end,
    };
  }

  if (req.query.sitevisit && req.query.date) {
    const start = dayjs(req.query.date).startOf("day").toDate();
    const end = dayjs(req.query.date).endOf("day").toDate();
    filter["siteDetails.scheduleDate"] = { $gte: start, $lte: end };
  }

  const data = await Leads.find(filter).populate("assignedTo");

  res.status(200).json({
    status: "success",
    data,
  });
});

// export const createdChallan = catchAsync(async (req, res) => {
//   const data = req.body;

//   if (!data || Object.keys(data).length === 0) {
//     return res.status(400).json({
//       message: "Bad Request. No data provided.",
//     });
//   }
//   const useriD = req.body.userId;
//   const user = await User.findById(useriD);

//   let df = {
//     ...data,
//     addedBy: user.name,
//     addedDate: new Date(),
//   };

//   const created = await Dchallan.create(df);


//   res.status(201).json({
//     message: "Challan created successfully",
//     data: created,
//   });
// });

export const createdChallan = catchAsync(async (req, res, next) => {
  const { challanDesc, lead, bomId } = req.body;


  // 2. Update BOM & Product stock
  const bom = await BOM.findById(bomId);
  if (!bom) {
    return next(new AppError("BOM not found", 404));
  }

  // Loop through each challan product
  for (const item of challanDesc) {
    const { productId, qty } = item;

    const bom = await BOM.findById(bomId);
    if (!bom) return next(new AppError("BOM not found", 404));

    for (const item of challanDesc) {
      const { productId, qty } = item;

      for (const pt of bom.productTable) {
        for (const prod of pt.products) {
          if (String(prod.productId) === String(productId)) {
            prod.balQuantity = (prod.quantity) - qty;
            pt.markModified('products');
          }
        }
      }
    }
    bom.markModified('productTable'); // mark outer array modified too

    await bom.save();


    // Update Product stock
    await Product.findByIdAndUpdate(productId, {
      $inc: { stock: -qty }
    });

  }

  const challan = await Dchallan.create(req.body);
  res.status(201).json({
    status: "success",
    data: challan,
    bom: bom

  });
});


export const getChallanByLeadId = catchAsync(async (req, res) => {
  const { leadId } = req.query;

  if (!leadId) {
    return res.status(400).json({
      message: "Missing required query parameter: leadId",
    });
  }

  const data = await Dchallan.find({ lead: leadId });

  res.status(200).json({
    message: "Success",
    data,
  });
});

// export const getChallanById = catchAsync(async (req, res) => {
//   const { challenId } = req.query;

//   if (!challenId) {
//     return res.status(400).json({
//       message: "Missing required query parameter: challenId",
//     });
//   }

//   const data = await Dchallan.findById(challenId);

//   res.status(200).json({
//     message: "Success",
//     data,
//   });
// });
export const getChallanById = catchAsync(async (req, res) => {
  const { _id } = req.query;

  if (!_id) {
    return res.status(400).json({
      message: "Missing required query parameter: _id",
    });
  }

  const data = await Dchallan.findById(_id);

  if (!data) {
    return res.status(404).json({
      message: "Challan not found",
    });
  }

  res.status(200).json({
    message: "Success",
    data,
  });
});
export const updateChallanById = catchAsync(async (req, res) => {
  const { _id } = req.query;
  if (!_id) {
    return res.status(400).json({
      message: "Missing required query parameter: _id",
    });
  }

  const updatedChallan = await Dchallan.findByIdAndUpdate(_id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedChallan) {
    return res.status(404).json({
      message: "Challan not found",
    });
  }

  res.status(200).json({
    message: "Challan updated successfully",
    data: updatedChallan,
  });
});


export const scheduleCreate = catchAsync(async (req, res) => {
  if (req.files) {
    if (req.files?.deliveryChallan) {
      req.body.deliveryChallan = req.files?.deliveryChallan[0].filename;
    }
  }

  const user = await User.findById(req.body.userId);

  let df = {
    ...req.body,
    // addedBy: user.name,
    addedDate: new Date(),
  };

  const schedule = await Schedule.create(df);
  res.status(201).json({
    status: "success",
    message: "Schedule created successfully",
    data: { schedule },
  });
});

export const getScheduleBy = catchAsync(async (req, res) => {
  const { leadId } = req.query;


  if (!leadId) {
    return res
      .status(400)
      .json({ message: "Missing required query parameter: leadId" });
  }

  const datas = await Schedule.find({ lead: leadId });

  res.status(200).json({ message: "Success", datas });
});

// LeadController.js
export const decideDesignFile = catchAsync(async (req, res, next) => {
  const { id, fileId } = req.params;
  const { decision, userId } = req.body;
  const lead = await Leads.findById(id);
  if (!lead) return next(new AppError("Lead not found", 404));

  const file = lead.designFiles.id(fileId);
  if (!file) return next(new AppError("File not found", 404));

  file.status = decision;           // new field
  file.decisionBy = userId;
  file.decisionAt = Date.now();

  await lead.save();

  res.status(200).json({ status: "success", data: { file } });
});
