import { Router } from "express";
import { getAllProducts } from "../../../seller-backend/src/controllers/Product.js";
import { auth, isCustomer } from "../../../../shared/middlewares/auth.js";
import { createRatingAndReview, getAllRatingAndReviews, getAverageRating } from "../controllers/RatingAndReviews.js";

const router = Router();

router.get("/getAllProducts", getAllProducts);
router.post("/createRatingAndReviews", auth, isCustomer, createRatingAndReview);
router.get("/getAvgRating", getAverageRating);
router.get("/getAllRatingAndReviews", getAllRatingAndReviews);

export {
    router
}
