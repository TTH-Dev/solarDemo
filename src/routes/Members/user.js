import express, { urlencoded } from 'express';

import {
    createUser,
    userLogin,
    userOtpVerify,
    resendOTP,
    getUserById,
    updateUser,
    deleteUser,
    getAllUsers,
    getUserDmmenu,
    getCurrentUser,
} from "../../controllers/Members/User.js";
import { protect } from '../../controllers/Admin/admin.js';

const userRouter = express.Router();

userRouter.route("/").get(getAllUsers).post(createUser);

userRouter.get("/dmMenu", getUserDmmenu);

userRouter.post("/login", userLogin);

userRouter.post("/otp-verify", userOtpVerify);

userRouter.post("/resend-otp", resendOTP);

userRouter.route("/getById/:id").get(getUserById).patch(updateUser).delete(deleteUser);

userRouter.get("/getMe",protect, getCurrentUser);


export default userRouter;
