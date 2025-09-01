import catchAsync from "../../utils/catchAsync.js";
import jwt from "jsonwebtoken";
import AppError from "../../utils/AppError.js";
import Admin from "../../models/Admin/admin.js";
import sendEmail from "../../utils/email.js";
import { AdminOTP } from "../../models/Admin/admin.js";
import User from "../../models/Members/User.js";

const cookieExpireIn = parseInt(process.env.JWT_COOKIE_EXPIRES_IN);

const cookieOptions = {
  expires: new Date(Date.now() + cookieExpireIn * 24 * 60 * 60 * 1000),
  httpOnly: false,
  secure: false,
  sameSite: "none",
};

const jwtsecret = process.env.JWT_SECRET;

const jwtExpiresIn = process.env.JWT_EXPIRES_IN;

const signToken = (id) => {
  return jwt.sign({ id }, jwtsecret, { expiresIn: jwtExpiresIn });
};

export const adminSignup = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide an email and password", 400));
  }

  const existingAdmin = await Admin.findOne({ email });

  if (existingAdmin) {
    return next(new AppError("Admin with this email already exists", 400));
  }

  const newUser = await Admin.create({
    email,
    role: "admin",
    password,
  });

  const token = signToken(newUser._id);

  res.cookie("token", token, cookieOptions);

  res.status(201).json({
    status: "success",
    message: "Admin registered successfully",
  });
});

export const adminLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide an email and password", 400));
  }

  const user = await Admin.findOne({ email }).select("+password");
  if (!user) {
    return next(new AppError("Admin not found", 404));
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return next(new AppError("Invalid password", 401));
  }

  const token = signToken(user._id);

  res.cookie("token", token, cookieOptions);

  res.status(200).json({
    message: "Login successful",
    token,
  });
});

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const admin = await Admin.findOne({ email });
  if (!admin) {
    return next(new AppError("Admin not found", 404));
  }

  const OTP = admin.createPasswordOtp();
  await admin.save({ validateBeforeSave: false });

  await AdminOTP.findOneAndUpdate(
    { email },
    { otp: OTP, createdAt: Date.now() },
    { upsert: true }
  );

  const message = `Forgot your password? Your one-time password is ${OTP}.`;
  await sendEmail({
    from: process.env.SMTP_USER,
    to: req.body.email,
    subject: "Password Reset OTP",
    text: message,
  });

  res.status(200).json({
    message: "OTP sent to email",
  });
});

export const otpValidation = catchAsync(async (req, res, next) => {
  const { email, otpCode } = req.body;

  if (!email || !otpCode) {
    return next(new AppError("Email and Otp is Required", 404));
  }

  const otpData = await AdminOTP.findOne({ email });

  if (!otpData) {
    return res
      .status(400)
      .json({ message: "Otp Not Generated for this Login" });
  }

  if (otpData.otp !== otpCode) {
    return res.status(400).send("Invalid OTP");
  }

  res.status(200).json({ message: "OTP is valid", email });
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { newPassword, email } = req.body;

  const otpData = await AdminOTP.findOne({ email });

  if (!otpData) {
    return next(new AppError("OTP expired", 400));
  }

  if (!email) {
    return next(new AppError("Email not found or OTP expired", 400));
  }

  const admin = await Admin.findOne({ email });
  if (!admin) {
    return next(new AppError("admin not found", 404));
  }

  admin.password = newPassword;
  await admin.save();

  await AdminOTP.deleteOne({ email });

  res.status(200).json({ message: "Password has been reset successfully" });
});

export const updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const admin = await Admin.findById(req.admin._id).select("+password");
  if (!admin) {
    return next(new AppError("admin not found", 404));
  }

  const isPasswordValid = await admin.comparePassword(currentPassword);
  if (!isPasswordValid) {
    return next(new AppError("Invalid password", 401));
  }
  admin.password = newPassword;
  await admin.save();
  res.status(200).json({ message: "Password update successful" });
});

export const updateAdmin = catchAsync(async (req, res, next) => {
  const {id } = req.params;


  if (req.files) {
    if (req.files.profileImage) {
      req.body.profileImage = req.files?.profileImage[0].filename;
    }
  }

  let admin;

    admin = await Admin.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

  if (!admin) {
    admin = await User.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      admin
    },
  });
});

export const logoutAdmin = (req, res) => {
  try {
    res.clearCookie("token", { httpOnly: true, secure: true });
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Failed to log out" });
  }
};

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }
    if (!token) {
      return res
        .status(401)
        .json({ message: "Not authorized, no token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure JWT_SECRET is in .env

    let user = await Admin.findById(decoded.id);

    if (!user) {
      user = await User.findById(decoded.id);
    }

    // if (!user) {
    //     user = await Subadmin.findById(decoded.userId);
    //     if (!user) {
    //         return next(new AppError("Subadmin not found", 404));
    //     }
    //     req.subadmin = user;
    // } else if (!user) {
    //     return next(new AppError("User not found", 404));
    // } else {
    //     req.admin = user;
    // }

    req.admin = user;

    next();
  } catch (error) {
    console.error("Authorization error:", error);
    res.status(401).json({ message: "Not authorized" });
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return res
        .status(403)
        .json({ message: "You do not have permission to perform this action" });
    }
    next();
  };
};

export const getAdmin = catchAsync(async (req, res, next) => {
  const admin = req.admin;
  res.status(200).json({ admin });
});
