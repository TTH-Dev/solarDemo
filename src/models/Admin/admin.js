import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const adminSchema = new mongoose.Schema(
    {

        email: {
            type: String,
            unique: true,
            required: true
        },
        password: {
            type: String,
            require: true,
            select: false
        },
        role: {
            type: String,
            enum: ["admin",],
            default: "admin",
            require: true
        },
        position: {
            type: String
        },
        phoneNo: {
            type: String,
        },
        profileImage: {
            type: String,
        },
        name: {
            type: String,
        },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
        }

    },
    { timestamps: true }
);

adminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

adminSchema.pre("save", function (next) {
    if (this.isModified("password") && !this.isNew) {
        this.passwordChangesAt = new Date(Date.now() - 1000);
    }
    next();
});


adminSchema.methods.comparePassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
}

adminSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = this.passwordChangedAt.getTime() / 1000;
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

adminSchema.methods.createPasswordResetToken = async function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
};

adminSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = this.passwordChangedAt.getTime() / 1000;
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

adminSchema.methods.createPasswordOtp = function () {
    this.otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return this.otpCode;
};

adminSchema.methods.GenerateOtp = function () {
    this.otp = Math.floor(100000 + Math.random() * 900000).toString();
    return this.otp;
};

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;



const adminOtpSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 300 },
});

export const AdminOTP = mongoose.model("AdminOTP", adminOtpSchema);