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

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        required: true
    },

    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    }]
    
}, { timestamps: true });

const Category = mongoose.model("Category", categorySchema);

export {
    Category
}