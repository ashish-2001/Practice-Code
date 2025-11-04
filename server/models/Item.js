import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({

    itemName: {
        type: String,
        required: true
    },

    itemDescription: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    tags: [{
        type: String,
        required: true
    }],

    thumbnailImage: {
        type: String,
        required: true
    },

    ratingAndReviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "RatingAndReview"
    }],

    itemStocks: {
        type: String,
        required: true
    },

    customerBuyed: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    }
});

const Item = mongoose.model("Item", itemSchema);

export{
    Item
}