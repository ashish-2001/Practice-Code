import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({

    categoryName: {
        type: String,
        required: true
    },

    categoryDescription: {
        type: String,
        required: true
    },

    thumbnailImage: {
        type: String
    },

    products: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }

}, { timestamps: true });

const Category = mongoose.model("Category", CategorySchema);

export {
    Category
}