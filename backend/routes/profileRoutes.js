import express from "express";
import { auth, isAdmin } from "../middlewares/auth";
import { adminDashboard, deleteAccount, getAllUserDetails, getPurchasedProducts, updateDisplayPicture, updateProfile } from "../controllers/User";

const router = express.Router();

router.delete("/deleteProfile", auth, deleteAccount);
router.get("/getUserDetails", auth, getAllUserDetails);
router.get("/getPurchasedProducts", getPurchasedProducts);
router.get("/getAdminDashboard", auth, isAdmin, adminDashboard);
router.put("/updateProfile", auth, updateProfile);
router.put("/updateDisplayPicture", auth, updateDisplayPicture);

export {
    router
}