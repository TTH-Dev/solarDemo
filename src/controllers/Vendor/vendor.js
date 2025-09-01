// import Vendor from "../../models/Vendor/vendor.js";
// import catchAsync from "../../utils/catchAsync.js";
// import AppError from "../../utils/AppError.js";
// import APIFeatures from "../../utils/ApiFeatures.js";

// export const createVendor = catchAsync(async (req, res, next) => {

//     const { name, location } = req.body;

//     const data = {
//         name: name,
//         location: location,
//         phoneNo: req.body.phoneNo,
//         email: req.body.email
//     };

//     const vendor = await Vendor.create(data);

//     res.status(201).json({
//         status: "success",
//         message: "Vendor created successfully",
//         data: { vendor },

//     });
// });

// export const getAllVendors = catchAsync(async (req, res, next) => {
//     const limit = parseInt(req.query.limit) || 10;
//     const page = parseInt(req.query.page) || 1;


//     let filter = {};

//     if (req.query.name) {
//         filter.name = req.query.name
//     }
//     if (req.query.phoneNo) {
//         filter.phoneNo = req.query.phoneNo
//     }

//     const features = new APIFeatures(Vendor.find(filter), req.query)
//         .limitFields()
//         .sort()
//         .paginate();

//     const vendors = await features.query;

//     const totalRecords = await Vendor.countDocuments(filter);
    
//     const totalPages = Math.ceil(totalRecords / limit);

//     const VendorNames = await Vendor.find().distinct("name");

//     const vendorPhoneNo = await Vendor.find().distinct("phoneNo");

//     res.status(200).json({
//         status: "success",
//         totalPages,
//         currentPage: page,
//         result: vendors.length,
//         data: {
//             vendors, dmMenu: {
//                 VendorNames,
//                 vendorPhoneNo

//             }
//         },
//     });
// });

// export const getVendorById = catchAsync(async (req, res, next) => {
//     const vendor = await Vendor.findById(req.params.id);

//     if (!vendor) {
//         return next(new AppError("Vendor not found", 404));
//     }

//     res.status(200).json({
//         status: "success",
//         data: { vendor },
//     });
// });

// export const updateVendor = catchAsync(async (req, res, next) => {

//     const { id } = req.params;

//     const updatedVendor = await Vendor.findByIdAndUpdate(id, req.body, {
//         new: true,
//         runValidators: true,
//     });

//     if (!updatedVendor) {
//         return next(new AppError("Vendor not found", 404));
//     }

//     res.status(200).json({
//         status: "success",
//         data: { updatedVendor },
//     });
// });

// export const deleteVendor = catchAsync(async (req, res, next) => {
//     const deletedVendor = await Vendor.findByIdAndDelete(req.params.id);

//     if (!deletedVendor) {
//         return next(new AppError("Vendor not found", 404));
//     }

//     res.status(204).json({
//         status: "success",
//         data: null,
//     });
// });

import Vendor from "../../models/Vendor/vendor.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import APIFeatures from "../../utils/ApiFeatures.js";

export const createVendor = catchAsync(async (req, res, next) => {
  const { name, phoneNo, location, gstNo, contactPerson, email } = req.body;

  const data = {
    name,
    phoneNo,         // expected to be an array of strings
    location,
    gstNo,
    contactPerson,
    email,
  };

  const vendor = await Vendor.create(data);

  res.status(201).json({
    status: "success",
    message: "Vendor created successfully",
    data: { vendor },
  });
});

export const getAllVendors = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  let filter = {};

  if (req.query.name) {
    filter.name = req.query.name;
  }
  if (req.query.phoneNo) {
    filter.phoneNo = req.query.phoneNo;
  }

  const features = new APIFeatures(Vendor.find(filter), req.query)
    .limitFields()
    .sort()
    .paginate();

  const vendors = await features.query;

  const totalRecords = await Vendor.countDocuments(filter);
  const totalPages = Math.ceil(totalRecords / limit);

  const VendorNames = await Vendor.find().distinct("name");
  const vendorPhoneNo = await Vendor.find().distinct("phoneNo");

  res.status(200).json({
    status: "success",
    totalPages,
    currentPage: page,
    result: vendors.length,
    data: {
      vendors,
      dmMenu: {
        VendorNames,
        vendorPhoneNo,
      },
    },
  });
});

export const getVendorById = catchAsync(async (req, res, next) => {
  const vendor = await Vendor.findById(req.params.id);

  if (!vendor) {
    return next(new AppError("Vendor not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { vendor },
  });
});

export const updateVendor = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const updatedVendor = await Vendor.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedVendor) {
    return next(new AppError("Vendor not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { updatedVendor },
  });
});

export const deleteVendor = catchAsync(async (req, res, next) => {
  const deletedVendor = await Vendor.findByIdAndDelete(req.params.id);

  if (!deletedVendor) {
    return next(new AppError("Vendor not found", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
