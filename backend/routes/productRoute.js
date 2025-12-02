import express from "express";
import { auth, isAdmin, isCustomer } from "../middlewares/auth.js";
import { createProduct, deleteProduct, editProducts, getAllProducts, getAdminProducts, searchProduct } from "../controllers/Product.js";
import { addProductToCategory, categoryPageDetails, createCategory, showAllCategories } from "../controllers/Category.js";
import { createRatingAndReview, getAllRatingAndReviews, getAverageRating } from "../controllers/RatingAndReviews.js";

const router = express.Router();

router.post("/createProduct", auth, isAdmin, createProduct);
router.get("/getAdminProduct", isAdmin, getAdminProducts);
router.put("/editProduct", isAdmin, editProducts);
router.delete("/deleteProduct", isAdmin, deleteProduct);

router.post("/createCategories", isAdmin, createCategory);
router.get("/showAllCategories", showAllCategories);
router.post("/categoryPageDetails", categoryPageDetails);
router.post("/addProductToCategory", isAdmin, addProductToCategory);

router.post("/createRatingAndReviews", auth, isCustomer, createRatingAndReview);
router.get("/getAvgRating", getAverageRating);
router.get("/getAllRatingAndReviews", getAllRatingAndReviews);

router.get("/getAllProducts", getAllProducts);
router.get("/searchCourse", searchProduct);

export {
    router
}