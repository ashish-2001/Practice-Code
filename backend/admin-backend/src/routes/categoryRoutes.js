import { Router } from "express";
import { auth, isAdmin } from "../../../../shared/middlewares/auth.js";
import { categoryPageDetails, createCategory, showAllCategories } from "../controllers/Category.js";

const router = Router();

router.post("/createCategory", auth, isAdmin, createCategory);
router.get("/getCategories", showAllCategories);
router.get("/getCategoryPageDetails", categoryPageDetails);

export {
    router
}