import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({

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

    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }

}, { timestamps: true });

const Category = mongoose.model("Category", categorySchema);

export {
    Category
}