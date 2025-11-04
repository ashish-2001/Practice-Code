import mongoose from "mongoose";

const ratingAndReviewSchema = new mongoose.Schema({

    review: {
        type: String,
        required: true
    },

    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        index: true
    }
    
});

const RatingAndReview = mongoose.model("RatingAndReview", ratingAndReviewSchema);

export {
    RatingAndReview
}