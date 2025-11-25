import express, { Router } from "express";
import { changePassword, sendOtp, signin, signup } from "../controllers/User.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/sendOtp", sendOtp);
router.put("/changePassword", auth, changePassword);

export {
    router
}