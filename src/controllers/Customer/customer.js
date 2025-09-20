import Customer from "../../models/Customer/customer.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import APIFeatures from "../../utils/ApiFeatures.js";

export const getAllCustomer = catchAsync(async (req, res, next) => {
    const limit = req.query.limit || 10;
    const page = req.query.page || 1;

    let filter = {};

    if (req.query.companyName) {
        filter.companyName = req.query.companyName
    }

    if (req.query.phoneNo) {
        filter.phoneNo = req.query.phoneNo
    }
    const features = new APIFeatures(Customer.find(filter).populate("lead"), req.query)
        .limitFields()
        .sort()
        .paginate();

    const companyNames = await Customer.find().distinct("companyName");

    const phoneNo = await Customer.find().distinct("phoneNo");

    const customer = await features.query;

    const totalRecords = await Customer.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "success",
        totalPages,
        currentPage: page,
        result: customer.length,
        data: {
            customer, dmMenu: {
                companyNames,
                phoneNo
            }
        },
    });
});
export const getAllOldCustomer = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  const skip = (page - 1) * limit;

  let customerFilter = {};

  if (req.query.companyName) {
    customerFilter.companyName = req.query.companyName;
  }

  if (req.query.phoneNo) {
    customerFilter.phoneNo = req.query.phoneNo;
  }

  const projectProcessStatusFilter = req.query.projectProcessStatus;

  const pipeline = [
    { $match: customerFilter },

    {
      $lookup: {
        from: "leads",
        localField: "lead",
        foreignField: "_id",
        as: "lead",
      },
    },
    { $unwind: "$lead" },

    // 👇 Lookup to get the project linked to this lead
    {
      $lookup: {
        from: "projects",
        localField: "lead._id",
        foreignField: "lead",
        as: "project",
      },
    },
    {
      $unwind: {
        path: "$project",
        preserveNullAndEmptyArrays: true, // Optional: handle customers without a project
      },
    },
  ];

  if (projectProcessStatusFilter) {
    pipeline.push({
      $match: {
        "lead.projectProcessStatus": projectProcessStatusFilter,
      },
    });
  }

  const totalRecordsPipeline = [...pipeline, { $count: "count" }];
  const totalCountResult = await Customer.aggregate(totalRecordsPipeline);
  const totalRecords = totalCountResult[0]?.count || 0;

  pipeline.push({ $skip: skip }, { $limit: limit });

  const customer = await Customer.aggregate(pipeline);

  const companyNames = await Customer.find().distinct("companyName");
  const phoneNo = await Customer.find().distinct("phoneNo");

  const totalPages = Math.ceil(totalRecords / limit);

  res.status(200).json({
    status: "success",
    totalPages,
    currentPage: page,
    result: customer.length,
    data: {
      customer,
      dmMenu: {
        companyNames,
        phoneNo,
      },
    },
  });
});


export const getCustomerById = catchAsync(async (req, res, next) => {
    const customer = await Customer.findById(req.params.id).populate("lead");

    if (!customer) {
        return next(new AppError("Leads not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: { customer },
    });

});

export const updateCustomer = catchAsync(async (req, res, next) => {
    const { id } = req.params;


    const updatedCustomer = await Customer.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!updatedCustomer) {
        return next(new AppError("Customer not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: { updatedCustomer },
    });
});

export const deleteCustomer = catchAsync(async (req, res, next) => {
    const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);

    if (!deletedCustomer) {
        return next(new AppError("Customer not found", 404));
    }

    res.status(204).json({
        status: "success",
        data: null,
    });
});

