import mongoose from "mongoose";

const ratingAndReviewSchema = new mongoose.Schema({

    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    
    rating: {
        type:Number,
        required: true,
        min: 1,
        max: 5
    },

    title: {
        type: String
    },

    comment: {
        type: String
    },

    approved: {
        type: Boolean,
        default: false
    },

    helpFullCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

ratingAndReviewSchema.index({ product: 1, approved: 1 });

const RatingAndReviews = mongoose.model("RatingAndReviews", ratingAndReviewSchema);

export {
    RatingAndReviews
}