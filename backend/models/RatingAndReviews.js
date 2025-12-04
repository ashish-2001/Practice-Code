import mongoose from "mongoose";

const RatingAndReviewSchema = new mongoose.Schema({

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

RatingAndReviewSchema.index({ product: 1, approved: 1 });

const RatingAndReviews = mongoose.model("RatingAndReviews", RatingAndReviewSchema);

export {
    RatingAndReviews
}