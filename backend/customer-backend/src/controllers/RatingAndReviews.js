import z from "zod";
import { Product } from "../../../../shared/models/Product.js";
import { RatingAndReviews } from "../../../../shared/models/RatingAndReviews.js";
import mongoose from "mongoose";

const ratingAndReviewsValidator = z.object({
    rating: z.number().min(1, "Rating is required!"),
    review: z.string().min(1, "Review is required!"),
    productId: z.string().min(1, "Product id is required!")
});

async function createRatingAndReview(req, res){

    try{

        const parsedResult = ratingAndReviewsValidator.safeParse(req.body);

        if(!parsedResult.success){
            return res.status(402).json({
                success: false,
                message: "All fields are required!"
            });
        };

        const userId = req.user?.userId;

        const {
            rating,
            review,
            productId
        } = parsedResult.data;

        const productDetails = await Product.findOne({
            _id: productId,
            customerPurchased: {
                $elemMatch: {
                    $eq: userId
                }
            }
        });

        if(!productDetails){
            return res.status(404).json({
                success: false,
                message: "No products purchased by you!"
            });
        };

        const ratingAndReviews = await RatingAndReviews.create({
            rating: rating,
            review: review,
            user: userId,
            product: productId
        });

        await Product.findByIdAndUpdate(productId, {
            $push: {
                ratingAndReviews: ratingAndReviews._id
            }
        });

        return res.status(200).json({
            success: true,
            message: "Rating and review created successfully!",
            ratingAndReviews
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: 'Internal server error!',
            error
        });
    };
};

async function getAverageRating(req, res){

    try{
        const { productId } = req.body || req.query;

        const result = await RatingAndReviews.aggregate([
            {
                $match: {
                    product: new mongoose.Types.ObjectId(productId)
                }
            },
            {
                $group: {
                    _id: null,
                    avgRating: {
                        $avg: "$rating"
                    }
                }
            }
        ]);

        if(result.length){
            return res.status(200).json({
                success: true,
                avgRating: result[0].avgRating
            });
        } else{
            return res.status(200).json({
                success: true,
                avgRating: 0
            });
        }
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error
        });
    };
};

async function getAllRatingAndReviews(req, res){

    try{
        const allReviews = (await RatingAndReviews.find()).toSorted({ rating: -1 }).populate({
            path: "user",
            select: "firstName lastName profileImage"
        }).populate({
            path: "product",
            select: "productName"
        });

        return res.status(200).json({
            success: false,
            message: "All reviews data fetched successfully!",
            data: allReviews
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error
        });
    }
}


export {
    createRatingAndReview,
    getAverageRating,
    getAllRatingAndReviews
}