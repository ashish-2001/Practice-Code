import mongoose from "mongoose";

const ratingAndReviewSchema = new mongoose.Schema({
    
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },

    rating: {
        type:Number,
        required: true,
        min: 1,
        max: 5
    },
    
    review: {
        type: String,
        required: true
    }
}, { timestamps: true });

ratingAndReviewSchema.index({
    user: 1,
    product: 1
}, { unique: true });

const RatingAndReviews = mongoose.model("RatingAndReviews", ratingAndReviewSchema);

export {
    RatingAndReviews
}