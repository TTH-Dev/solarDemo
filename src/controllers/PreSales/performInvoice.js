import PerformInvoice from "../../models/PreSales/performInvoice.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import APIFeatures from "../../utils/ApiFeatures.js";
import mongoose from "mongoose";

// Create Perform Invoice
// export const createPerformInvoice = catchAsync(async (req, res, next) => {
//    try {
//       const { lead, groupedProducts, totalAmount, status, fStatus } = req.body;

//       // Parse groupedProducts if sent as JSON string
//       let groupedProductsParsed = groupedProducts;
//       if (typeof groupedProducts === "string") {
//         groupedProductsParsed = JSON.parse(groupedProducts);
//       }

//       // Attach uploaded files to the right product's attachments array
//       // This depends on your front-end structure: which files correspond to which product?
//       // For simplicity, let's say all uploaded files go to the first product's attachments:
//       if (
//         groupedProductsParsed.length > 0 &&
//         groupedProductsParsed[0].products.length > 0
//       ) {
//         const product = groupedProductsParsed[0].products[0];

//         product.attachments = req.files.map((file) => ({
//           filename: file.filename,
//           originalname: file.originalname,
//           path: `/documents/${file.filename}`,
//         }));
//       }

//       const performInvoice = new PerformInvoice({
//         lead,
//         groupedProducts: groupedProductsParsed,
//         totalAmount,
//         status,
//         fStatus,
//       });

//       await performInvoice.save();

//       res.status(201).json({ message: "PerformInvoice created", performInvoice });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "Something went wrong" });
//     }

// });
export const createPerformInvoice = catchAsync(async (req, res, next) => {
  try {
    const { lead, groupedProducts, totalAmount, status, fStatus } = req.body;

    // Parse groupedProducts if sent as JSON string
    let groupedProductsParsed = groupedProducts;
    if (typeof groupedProducts === "string") {
      groupedProductsParsed = JSON.parse(groupedProducts);
    }

    // Helper function to find product by key in groupedProducts
    const findProductByKey = (groups, key) => {
      for (const group of groups) {
        const product = group.products.find(
          (prod) => prod.key === key || prod._key === key // adjust key name if needed
        );
        if (product) return product;
      }
      return null;
    };

    // Attach uploaded files to the right product's attachments based on file metadata
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        // Assume productKey is encoded in file.originalname or another property
        // For example, file.originalname might be: "productKey-<key>-filename.ext"
        const match = file.originalname.match(/productKey-([^-\s]+)-/);
        if (match && match[1]) {
          const productKey = match[1];
          const product = findProductByKey(groupedProductsParsed, productKey);

          if (product) {
            if (!product.attachments) product.attachments = [];
            product.attachments.push({       // ✅ User-friendly name
              storedFilename: file.filename,     // ✅ Actual saved name
              filename: newFilename,      // This is the generated unique filename
              path: `/documents/${newFilename}`,
              // ✅ Useful as fallback
              uploadedAt: new Date(),            // Optional metadata
            });
          }
        }
      });
    }

    const performInvoice = new PerformInvoice({
      lead,
      groupedProducts: groupedProductsParsed,
      totalAmount,
      status,
      fStatus,
    });

    await performInvoice.save();

    res.status(201).json({ message: "PerformInvoice created", performInvoice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Get all Perform Invoices
export const getAllPerformInvoices = catchAsync(async (req, res, next) => {
   const filter = {};
  
  if (req.query.leadId) {
    filter.lead = req.query.leadId;
  }
  const features = new APIFeatures(
    PerformInvoice.find(filter)
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
  try {
    let { groupedProducts, status, fStatus, totalAmount } = req.body;

    // Parse groupedProducts if it's a string
    if (typeof groupedProducts === "string") {
      groupedProducts = JSON.parse(groupedProducts);
    }

    // Helper to find product by key
    const findProductByKey = (groups, key) => {
      for (const group of groups) {
        const product = group.products.find(
          (prod) => prod.key === key || prod._key === key
        );
        if (product) return product;
      }
      return null;
    };

    // Handle uploaded files
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        // Use originalname format: "productKey-<key>-filename.ext"
        const match = file.originalname;
        if (match && match[1] && match[2]) {
          const productKey = match[1];
          const originalFilename = match[2];

          const product = findProductByKey(groupedProducts, productKey);

          if (product) {
            if (!product.attachments) product.attachments = [];

            product.attachments.push({
              storedFilename: file.filename,                 // Actual saved filename
              filename: originalFilename,                    // User-facing filename
              path: `/documents/${file.filename}`,           // Path to access
              uploadedAt: new Date(),                        // Optional
            });
          }
        }
      });
    }

    // Update Perform Invoice
    const invoice = await PerformInvoice.findByIdAndUpdate(
      req.params.id,
      {
        groupedProducts,
        status,
        fStatus,
        totalAmount,
      },
      { new: true, runValidators: true }
    );

    if (!invoice) return next(new AppError("Invoice not found", 404));

    res.status(200).json({ status: "success", data: { invoice } });

  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Failed to update perform invoice" });
  }
});



// Delete Perform Invoice
export const deletePerformInvoice = catchAsync(async (req, res, next) => {
  const deleted = await PerformInvoice.findByIdAndDelete(req.params.id);
  if (!deleted) return next(new AppError("Invoice not found", 404));
  res.status(204).json({ status: "success", data: null });
});
