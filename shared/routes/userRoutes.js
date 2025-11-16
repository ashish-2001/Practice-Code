import { Router } from "express";
import { changePassword, signin, signup } from "../controllers/User.js";
import { auth } from "../middlewares/auth";
import { resetPassword, resetPasswordToken } from "../controllers/ResetPassword.js";
import { searchProduct } from "../../backend/seller-backend/src/controllers/Product.js";

const router = Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/resetPassword", resetPassword);
router.put("changePassword", auth, changePassword);
router.post("/resetPasswordToken", resetPasswordToken);
router.post("/searchProducts", searchProduct);

export {
    router
};