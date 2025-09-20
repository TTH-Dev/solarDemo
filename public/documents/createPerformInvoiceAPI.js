// Updated createPerformInvoice controller for your specific use case

import PerformInvoice from "../../models/PreSales/performInvoice.js";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Helper function to process uploaded files
const processUploadedFiles = (files) => {
  const processedFiles = [];
  
  if (files && files.length > 0) {
    files.forEach(file => {
      processedFiles.push({
        fileName: file.originalname, // Original filename for display
        fileId: path.basename(file.filename, path.extname(file.filename)), // UUID without extension
        storedFileName: file.filename, // UUID filename stored on disk
        fileUrl: `/uploads/${file.filename}`, // URL path for download
        filePath: file.path, // Full file path on server
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedAt: new Date()
      });
    });
  }
  
  return processedFiles;
};

// @desc    Create new perform invoice
// @route   POST /api/performInvoice?id={leadId}
// @access  Private
export const createPerformInvoice = asyncHandler(async (req, res) => {
  try {
    const { 
      groupedProducts, 
      lead,
      totalAmount = 0,
      status = "draft",
      fStatus = "draft"
    } = req.body;
    
    const leadId = req.query.id || lead; // Support both query param and body

    // Validate lead ID
    if (!leadId || !mongoose.Types.ObjectId.isValid(leadId)) {
      return res.status(400).json({
        success: false,
        message: "Valid lead ID is required"
      });
    }

    // Process file uploads from multer
    let uploadedFilesByField = {};
    if (req.files) {
      // Handle different field types from uploadCompanyImages middleware
      Object.keys(req.files).forEach(fieldName => {
        uploadedFilesByField[fieldName] = processUploadedFiles(req.files[fieldName]);
      });
    }

    // Process grouped products and assign uploaded files
    let processedGroupedProducts = [];
    if (groupedProducts && Array.isArray(groupedProducts)) {
      processedGroupedProducts = groupedProducts.map((group, groupIdx) => {
        const processedGroup = {
          productType: group.productType,
          status: group.status || "draft",
          products: []
        };

        if (group.products && Array.isArray(group.products)) {
          processedGroup.products = group.products.map((product, productIdx) => {
            // Auto-calculate balance quantity
            const balQty = product.balQuantity !== undefined 
              ? product.balQuantity 
              : Math.max(0, (product.requestQty || 0) - (product.quantity || 0));

            // Process vendors
            let vendors = [];
            if (product.vendors && Array.isArray(product.vendors)) {
              vendors = product.vendors
                .filter(v => v.vendor) // Only include vendors with valid IDs
                .map(vendor => ({
                  vendor: vendor.vendor,
                  price: vendor.price || 0,
                  isSelected: vendor.isSelected || false
                }));
            }

            // Process attachments - combine existing attachments with newly uploaded files
            let attachments = [];
            
            // Add existing attachments (if any)
            if (product.attachments && Array.isArray(product.attachments)) {
              attachments = [...product.attachments];
            }

            // Add newly uploaded files for this specific product
            // You can implement a mapping strategy here based on your frontend needs
            // For now, we'll add files from images[0], images[1], etc. if they exist
            const productKey = `${groupIdx}-${productIdx}`;
            
            // Check for files uploaded for this specific product
            // This assumes your frontend sends files with field names like 'images[0]', 'images[1]', etc.
            for (let i = 0; i < 5; i++) {
              const fieldName = `images[${i}]`;
              if (uploadedFilesByField[fieldName] && uploadedFilesByField[fieldName].length > 0) {
                // Add these files to the product's attachments
                attachments.push(...uploadedFilesByField[fieldName]);
              }
            }

            // Also check for general file uploads
            if (uploadedFilesByField['file']) {
              attachments.push(...uploadedFilesByField['file']);
            }

            return {
              productMaterial: product.productMaterial,
              productSpecification: product.productSpecification,
              productBrand: product.productBrand,
              requestQty: product.requestQty || 0,
              quantity: product.quantity || 0,
              balQuantity: balQty,
              unit: product.unit,
              vendors: vendors,
              attachments: attachments
            };
          });
        }

        return processedGroup;
      });
    }

    // Calculate total amount if needed
    let finalTotalAmount = totalAmount;
    if (finalTotalAmount === 0) {
      finalTotalAmount = calculateTotalAmount(processedGroupedProducts);
    }

    // Create the perform invoice
    const performInvoiceData = {
      lead: leadId,
      groupedProducts: processedGroupedProducts,
      totalAmount: finalTotalAmount,
      status: status,
      fStatus: fStatus
    };

    const performInvoice = await PerformInvoice.create(performInvoiceData);

    // Populate references for response
    let populatedInvoice = await performInvoice.populate([
      { path: 'lead' },
      { path: 'groupedProducts.products.vendors.vendor', model: 'Vendor' }
    ]);

    res.status(201).json({
      success: true,
      message: "Perform invoice created successfully",
      data: {
        invoice: populatedInvoice
      },
      uploadedFiles: Object.keys(uploadedFilesByField).length > 0 ? uploadedFilesByField : undefined
    });

  } catch (error) {
    console.error("Error creating perform invoice:", error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: errors
      });
    }

    // Handle cast errors (invalid ObjectId)
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format"
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate entry found"
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'production' ? {} : error.message
    });
  }
});

// Helper function to calculate total amount
const calculateTotalAmount = (groupedProducts) => {
  if (!groupedProducts || !Array.isArray(groupedProducts)) {
    return 0;
  }

  return groupedProducts.reduce((total, group) => {
    if (!group.products || !Array.isArray(group.products)) {
      return total;
    }

    const groupTotal = group.products.reduce((groupSum, product) => {
      if (!product.vendors || !Array.isArray(product.vendors)) {
        return groupSum;
      }

      // Find selected vendor or use first vendor
      const selectedVendor = product.vendors.find(v => v.isSelected) || product.vendors[0];
      if (selectedVendor && product.quantity) {
        return groupSum + (selectedVendor.price * product.quantity);
      }
      return groupSum;
    }, 0);

    return total + groupTotal;
  }, 0);
};