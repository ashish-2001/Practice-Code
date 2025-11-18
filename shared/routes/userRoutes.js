import { changePassword, sendOtp, signin, signup } from "../controllers/User.js";
import { auth } from "../middlewares/auth.js";
import { resetPassword, resetPasswordToken } from "../controllers/ResetPassword.js";
import { searchProduct } from "../../backend/seller-backend/src/controllers/Product.js";
import { Router } from "express";

const router = Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/sendOtp", sendOtp);
router.post("/resetPassword", resetPassword);
router.put("changePassword", auth, changePassword);
router.post("/resetPasswordToken", resetPasswordToken);
router.post("/searchProducts", searchProduct);

export {
    router
};