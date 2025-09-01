import PerformInvoice from "../../models/PreSales/performInvoice.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import APIFeatures from "../../utils/ApiFeatures.js";
import mongoose from "mongoose";

// Create Perform Invoice
export const createPerformInvoice = catchAsync(async (req, res, next) => {
  const invoice = await PerformInvoice.create(req.body);
  res.status(201).json({ status: "success", data: { invoice } });
});

// Get all Perform Invoices
export const getAllPerformInvoices = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    PerformInvoice.find()
      .populate("lead") // populate the lead
      .populate("groupedProducts.products.vendors.vendor"), // populate vendors array
    req.query
  )
    .limitFields()
    .sort()
    .paginate();

  const invoices = await features.query;

  res.status(200).json({
    status: "success",
    result: invoices.length,
    data: { invoices },
  });
});

// Get Perform Invoice by ID
export const getPerformInvoiceById = catchAsync(async (req, res, next) => {
  const invoice = await PerformInvoice.findById(req.params.id)
    .populate({
      path: "lead",
    })
    .populate({
      path: "groupedProducts.products.vendors.vendor", // populate vendors array
    });

  if (!invoice)
    return next(new AppError("Perform Invoice not found", 404));

  res.status(200).json({ status: "success", data: { invoice } });
});

// export const getAllPerformInvoicesByVendor = catchAsync(async (req, res, next) => {
//   const { id } = req.params;

//   if (!id || !mongoose.Types.ObjectId.isValid(id)) {
//     return next(new AppError("Valid vendorId query param is required", 400));
//   }

//   const filterQuery = {
//     "groupedProducts.products.vendors": {
//       $elemMatch: { vendor: new mongoose.Types.ObjectId(id) }
//     }
//   };

//   const features = new APIFeatures(
//     PerformInvoice.find(filterQuery)
//       .populate("lead")
//       .populate("groupedProducts.products.vendors.vendor"),
//     req.query
//   )
//     .limitFields()
//     .sort()
//     .paginate();

//   const invoices = await features.query;

//   res.status(200).json({
//     status: "success",
//     result: invoices.length,
//     data: { invoices },
//   });
// });


// Update Perform Invoice

export const getAllPerformInvoicesByVendor = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Valid vendorId query param is required", 400));
  }

  const vendorObjectId = new mongoose.Types.ObjectId(id);

  const invoices = await PerformInvoice.aggregate([
    // Match invoices where groupedProducts.products.vendors has the vendor with isSelected true
    {
      $match: {
        "groupedProducts.products.vendors": {
          $elemMatch: { vendor: vendorObjectId, isSelected: true }
        }
      }
    },
    // Filter groupedProducts.products array to only products with the vendor selected
    {
      $addFields: {
        groupedProducts: {
          $map: {
            input: "$groupedProducts",
            as: "grp",
            in: {
              productType: "$$grp.productType",
              status: "$$grp.status",
              products: {
                $filter: {
                  input: "$$grp.products",
                  as: "prod",
                  cond: {
                    $gt: [{
                      $size: {
                        $filter: {
                          input: "$$prod.vendors",
                          as: "vendor",
                          cond: {
                            $and: [
                              { $eq: ["$$vendor.vendor", vendorObjectId] },
                              { $eq: ["$$vendor.isSelected", true] }
                            ]
                          }
                        }
                      }
                    }, 0]
                  }
                }
              }
            }
          }
        }
      }
    },
    // Optionally lookup/populate references (lead, vendors)
    {
      $lookup: {
        from: "leads",
        localField: "lead",
        foreignField: "_id",
        as: "lead"
      }
    },
    { $unwind: { path: "$lead", preserveNullAndEmptyArrays: true } },
    // Populate vendor details inside products.vendors.vendor by separate lookup if needed (complex)
  ]);

  res.status(200).json({
    status: "success",
    result: invoices.length,
    data: { invoices },
  });
});


export const updatePerformInvoice = catchAsync(async (req, res, next) => {
  const invoice = await PerformInvoice.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!invoice) return next(new AppError("Invoice not found", 404));
  res.status(200).json({ status: "success", data: { invoice } });
});

// Delete Perform Invoice
export const deletePerformInvoice = catchAsync(async (req, res, next) => {
  const deleted = await PerformInvoice.findByIdAndDelete(req.params.id);
  if (!deleted) return next(new AppError("Invoice not found", 404));
  res.status(204).json({ status: "success", data: null });
});
