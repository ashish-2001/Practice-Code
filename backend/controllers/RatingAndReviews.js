import z, { success } from "zod";
import { Product } from "../models/Product.js"
import { RatingAndReviews } from "../models/RatingAndReviews.js";
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

        if(!userId){
            return res.status(401).json({
                success: false,
                message: "Unauthorized!"
            });
        };

        const {
            rating,
            review,
            productId
        } = parsedResult.data;

        const product = await Product.findById(productId);
        if(!product){
            return res.status(404).json({
                success: false,
                message: "Product not found!"
            });
        };

        const purchased = product.customerPurchased?.some((id) => id.toString() === userId);
        if(!purchased){
            return res.status(403).json({
                success: false,
                message: "You can only review products you have purchased!"
            });
        }

        const existingReview = await RatingAndReviews.findOne({
            user: userId,
            product: productId
        });

        if(existingReview){
            return res.status(409).json({
                success: false,
                message: "You have already reviewed this product!"
            });
        };

        const ratingData = await RatingAndReviews.create({
            rating,
            review,
            user: userId,
            product: productId
        });

        await Product.findByIdAndUpdate(productId, {
            $push: {
                ratingAndReviews: ratingData._id
            }
        });
    
        return res.status(200).json({
            success: true,
            message: "Rating and review created successfully!",
            data: ratingData
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

        if(!productId){
            return res.status(400).json({
                success: false,
                message: "Product id required!"
            });
        };

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

        return res.status(200).json({
            success: false,
            message: "Average rating fetched successfully!",
            avgRating: result.length ? result[0].avgRating : 0
        });
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