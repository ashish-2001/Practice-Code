import express from "express";
import { auth, isAdmin, isSeller, isCustomer } from "../middlewares/auth.js";
import { createProduct, deleteProduct, editProducts, getAllProducts, getSellerProducts, searchProduct } from "../controllers/Product.js";
import { addProductToCategory, categoryPageDetails, createCategory, showAllCategories } from "../controllers/Category.js";
import { createRatingAndReview, getAllRatingAndReviews, getAverageRating } from "../controllers/RatingAndReviews.js";

const router = express.Router();

router.post("/createProduct", auth, isSeller, createProduct);
router.get("/getSellerProduct", isSeller, getSellerProducts);
router.put("/editProduct", isSeller, editProducts);
router.delete("/deleteProduct", isSeller, deleteProduct);

router.post("/createCategories", isAdmin, createCategory);
router.get("/showAllCategories", showAllCategories);
router.post("/categoryPageDetails", categoryPageDetails);
router.post("/addProductToCategory", isSeller, addProductToCategory);

router.post("/createRatingAndReviews", auth, isCustomer, createRatingAndReview);
router.get("/getAvgRating", getAverageRating);
router.get("/getAllRatingAndReviews", getAllRatingAndReviews);

router.get("/getAllProducts", getAllProducts);
router.get("/searchCourse", searchProduct);

export {
    router
}