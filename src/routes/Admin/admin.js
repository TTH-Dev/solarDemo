import express from 'express';

import {
    adminLogin,
    adminSignup,
    forgotPassword,
    otpValidation,
    updatePassword,
    resetPassword,
    updateAdmin,
    protect,
    getAdmin    
 }  from "../../controllers/Admin/admin.js";

 import { uploadCompanyImages } from '../../utils/multerConfig.js';

 const adminRouter = express.Router();
 
 adminRouter.route("/signup").post(adminSignup);

 adminRouter.route("/login").post(adminLogin);
 
 adminRouter.route("/forgotPassword").post(forgotPassword);

adminRouter.route("/otpValidation").post(otpValidation);


adminRouter.route("/resetPassword").patch(resetPassword);

adminRouter.use(protect);

adminRouter.route("/updatePassword").patch(updatePassword);

adminRouter.route("/update-admin/:id").patch(uploadCompanyImages,updateAdmin);

adminRouter.route("/getMe").get(getAdmin);


export default adminRouter;
