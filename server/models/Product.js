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

    thumbnailImage: {
        type: String,
        required: true
    },

    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item"
    }],

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    }

});

const Product = mongoose.model("Product", productSchema);

export {
    Product
}