import Product from "../../models/Inventory/products.js";
import APIFeatures from "../../utils/ApiFeatures.js";
import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";
import Schedule from "../../models/Inventory/Schedule.js"


export const createProduct = catchAsync(async (req, res, next) => {
    const { productType, material, specification, brand, unit, stock, outOfStockThreshold } = req.body;

    const data = {
        productType: productType,
        material: material,
        specification: specification,
        brand: brand,
        unit: unit,
        stock: stock,
        outOfStockThreshold: outOfStockThreshold,
    }

    const product = await Product.create(data);

    res.status(200).json({
        status: "Success",
        data: {
            product
        }
    });
});


export const getAllProducts = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    let filter = {};

    if (req.query.productType) {
        filter.productType = req.query.productType;
    }
    if (req.query.brand) {
        filter.brand = req.query.brand;
    }
    if (req.query.material) {
        filter.material = req.query.material;
    }
    const features = new APIFeatures(Product.find(filter), req.query)
        .limitFields()
        .sort()
        .paginate();

    const product = await features.query;

    const brand = await Product.distinct("brand");
    const productType = await Product.distinct("productType");
    const material = await Product.distinct("material");

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
        status: "Success",
        totalPages,
        totalProducts,
        result: product.legth,
        data: {
            product,
            brand,
            productType,
            material
        }
    });
});


export const getProductById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
        return next(new AppError("Product Not Found!", 404));
    }
    res.status(200).json({
        status: "Success",
        data: {
            product
        }
    });
});

export const updateProductById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!product) {
        return next(new AppError("Product Not Found!", 404));
    }
    res.status(200).json({
        status: "Success",
        data: {
            product
        }
    });
});

export const deleteProductById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
        return next(new AppError("Product Not Found!", 404));
    }
    res.status(200).json({
        status: "Success",
        data: null
    });
});




