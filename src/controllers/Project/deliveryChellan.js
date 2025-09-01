import DeliveryChellan from "../../models/Project/deliveryChellan.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import APIFeatures from "../../utils/ApiFeatures.js";
import User from "../../models/Members/User.js";

export const createDeliveryChellan = catchAsync(async (req, res, next) => {
    const { userId } = req.body;
    let datas = {};

    if (req.files && req.files.deliveryChallan) {
        datas.deliveryChallan = req.files.deliveryChallan[0].filename;
    }

    const productTable = JSON.parse(req.body.productTable);
    const deliveryNote = JSON.parse(req.body.deliveryNote);
    const shipToDetails = JSON.parse(req.body.shipToDetails);
    const billToDetails = JSON.parse(req.body.billToDetails);

    const user = await User.findById(userId);

    const data = {
        productTable,
        deliveryNote,
        shipToDetails,
        billToDetails,
        deliveryChallan: datas.deliveryChallan,
        reciverName: req.body.reciverName,
        lead: req.body.lead,
        createdBy: user.name
    }
    const chellan = await DeliveryChellan.create(data);

    res.status(201).json({
        status: "success",
        data: { chellan },
    });
});

export const getAllDeliveryChellans = catchAsync(async (req, res, next) => {
    const limit = req.query.limit || 10;
    const page = req.query.page || 1;

    const filter = {};

    if (req.query.lead) {
        filter.lead = req.query.lead;
    }

    const features = new APIFeatures(
        DeliveryChellan.find(filter).populate("lead"),
        req.query
    )
        .sort()
        .limitFields()
        .paginate();

    const chellans = await features.query;
    const totalRecords = await DeliveryChellan.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "success",
        totalPages,
        currentPage: page,
        result: chellans.length,
        data: { chellans },
    });
});

export const getDeliveryChellanById = catchAsync(async (req, res, next) => {
    const chellan = await DeliveryChellan.findById(req.params.id).populate("lead");

    if (!chellan) {
        return next(new AppError("Delivery Chellan not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: { chellan },
    });
});

export const updateDeliveryChellan = catchAsync(async (req, res, next) => {
    const { id } = req.query;


    if (req.files) {
        if (req.files.deliveryChallan) {
            req.body.deliveryChallan = req.files.deliveryChallan[0].filename
        }
    }
    const updatedChellan = await DeliveryChellan.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!updatedChellan) {
        return next(new AppError("Delivery Chellan not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: { updatedChellan },
    });
});

export const deleteDeliveryChellan = catchAsync(async (req, res, next) => {
    const deletedChellan = await DeliveryChellan.findByIdAndDelete(req.params.id);

    if (!deletedChellan) {
        return next(new AppError("Delivery Chellan not found", 404));
    }

    res.status(204).json({
        status: "success",
        data: null,
    });
});
