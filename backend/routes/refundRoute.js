import express from "express";
import { requestRefund } from "../controllers/Refund.js";
import { auth } from "../middlewares/auth";

const router = express.router();

router.post("/refund", auth, requestRefund);

export {
    router
}