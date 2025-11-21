import mongoose from "mongoose";

const productSchema = new mongoose.Schema({

    productName: {
        type: String,
        required: true
    },

    productDescription: {
        type: String,
        required: true
    },

    productPrice: {
        type: Number,
        required: true
    },

    productStock: {
        type: Number,
        required: true
    },
    
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },

    productImage: {
        type: String
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    customerPurchased: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    ratingAndReviews: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RatingAndReviews"
    },

    status: [{
        type: String,
        enum: ["Draft", "Published"],
        default: "Draft"
    }]

}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

export {
    Product
}