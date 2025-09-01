import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import sendMail from "../../utils/email.js";
import APIFeatures from "../../utils/ApiFeatures.js";
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import User from "../../models/Members/User.js";
import { OTP } from "../../models/Members/User.js";
import Leads from "../../models/PreSales/leads.js";

const cookieExpireIn = parseInt(process.env.JWT_COOKIE_EXPIRES_IN);

const cookieOptions = {
    expires: new Date(Date.now() + cookieExpireIn * 24 * 60 * 60 * 1000),
    httpOnly: false,
    secure: false,
    sameSite: "none",
}

const jwtsecret = process.env.JWT_SECRET;

const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "90d";


const signToken = (id) => {
    return jwt.sign({ id }, jwtsecret, { expiresIn: jwtExpiresIn });
}

export const createUser = catchAsync(async (req, res, next) => {

    const { name, email, isLeadManage, accessModuels, position, rollNumber } = req.body;

    if (!email || !name || accessModuels.length === 0) {
        return next(new AppError("Fill required fields!", 404));
    }
    const existing = await User.findOne({ rollNumber });
    if (existing) {
        return next(new AppError("Roll Number already exists!", 400));
    }
    const data = {
        name: name,
        email: email,
        accessModuels: accessModuels,
        isLeadManage: isLeadManage,
        role: "user",
        position: position,
        rollNumber
    }

    const user = await User.create(data);



    res.status(200).json({
        status: "Success",
        data: {
            user
        }
    });
});

export const userLogin = catchAsync(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new AppError("Email is required", 404));
    }

    const accesesdUser = await User.findOne({ email });

    if (!accesesdUser) {
        return res.status(403).json({ message: "You Dont have a access to Login" });
    }

    const otpCode = Math.floor(1000 + Math.random() * 9000);
    const hashedOTP = await bcryptjs.hash(otpCode.toString(), 10);

    await OTP.findOneAndUpdate(
        { email },
        { otp: hashedOTP, createdAt: Date.now() },
        { upsert: true }
    );

    await sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: "Your OTP for Login",
        text: `Your OTP code is: ${otpCode}`,
    });

    res.status(200).json({
        message: "OTP sent successfully"
    });
});

export const userOtpVerify = catchAsync(async (req, res, next) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return next(new AppError("Email and Otp is Required", 404));
    }
    const otpData = await OTP.findOne({ email });

    if (!otpData) {
        return next(new AppError("Otp Expired Or Invalid", 404));
    }
    const isMatch = await bcryptjs.compare(otp, otpData.otp);

    if (!isMatch) {
        return next(new AppError("Invaild Otp", 404));
    }

    const user = await User.findOne({ email });


    const token = signToken(user._id);

    res.cookie('usertoken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 90 * 24 * 60 * 60 * 1000
    });
    await OTP.deleteOne({ email });

    res.status(200).json({
        message: "User Login Successfully",
        data: {
            token: token,
            user: user
        },
    });
});

export const resendOTP = catchAsync(async (req, res) => {
    const { email } = req.body;
    if (!email) return next(new AppError("Email is required", 404));

    const existingOTP = await OTP.findOne({ email });

    if (existingOTP) {
        const timeElapsed = (Date.now() - existingOTP.createdAt) / 1000;
        if (timeElapsed < 30) {
            return next(new AppError("Please wait before requesting a new OTP", 404));
        }
    }

    const otpCode = Math.floor(1000 + Math.random() * 9000);
    const hashedOTP = await bcryptjs.hash(otpCode.toString(), 10);

    await OTP.findOneAndUpdate(
        { email },
        { otp: hashedOTP, createdAt: Date.now() },
        { upsert: true, new: true }
    );

    await sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: "Your Resent OTP for Login",
        text: `Your new OTP code is: ${otpCode}`,
    });

    res.status(200).json({
        message: "OTP resent successfully"
    });
});


export const getUserById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
        return next(new AppError("User Not Found!", 404));
    }

    res.status(200).json({
        status: "Success",
        data: {
            user
        }
    });
});


export const updateUser = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(id, req.body,
        { new: true, runValidators: true });

    if (!user) {
        return next(new AppError("User Not Found!", 404));
    }

    res.status(200).json({
        status: "Success",
        data: {
            user
        }
    });
});


export const deleteUser = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
        return next(new AppError("User Not Found!", 404));
    }

    res.status(200).json({
        message: "User Deleted",
    });
});


export const getAllUsers = catchAsync(async (req, res, next) => {

    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

    let filter = {};

    if (req.query.isLeadManage) {
        filter.isLeadManage = req.query.isLeadManage
    }
    if (req.query.name) {
        filter.name = req.query.name
    }

    const features = new APIFeatures(User.find(filter).populate({ path: "lead", model: "Leads" }), req.query)
        .limitFields()
        .sort()
    // .paginate();

    const user = await features.query;
    const totalRecords = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "Success",
        totalPages: totalPages,
        currentPage: page,
        result: user.length,
        data: {
            user: user
        }
    });
});




export const getUserDmmenu = catchAsync(async (req, res, next) => {

    let filter = {};

    if (req.query.role) {
        filter.role = req.query.role
    }

    const users = await User.find(filter).lean();

    const counts = await Leads.aggregate([
        { $match: { designPerson: { $ne: null } } },
        { $group: { _id: "$designPerson", leadCount: { $sum: 1 } } }
    ]); const countsMap = counts.reduce((acc, cur) => {
        acc[cur._id.toString()] = cur.leadCount;
        return acc;
    }, {});

    const dmData = users.map((val) => {
        return {
            id: val._id,
            name: val.name,
            role: val.position,
            projectCount: countsMap[val._id.toString()] || 0
        }
    })
    res.status(200).json({
        status: "Success",
        data: {
            user: dmData
        }
    });
});


export const getCurrentUser = catchAsync(async (req, res, next) => {
    res.status(200).json({ user: req.admin });
});






