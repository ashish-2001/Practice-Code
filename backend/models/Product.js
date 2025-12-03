import mongoose from "mongoose";
import { Schema } from "zod/v3";

const productSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        trim: true,
        index: true
    },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
        index: true
    },

    price: {
        type: Number,
        required: true
    },
    
    discountPrice: {
        type: Number,
        required: true,
        default: null
    },

    stock: {
        type: Number,
        required: true,
        default: 0
    },

    minOrderQuantity: {
        type: Number,
        default: 1
    },

    images: [{
        type: String
    }],

    shortDescription: {
        type: String
    },

    description: {
        type: String
    },

    tags: [{
        type: String,
        index: true
    }],

    attributes: Schema.Types.Mixed,

    status: {
        type: String,
        enum: ['active', 'draft'],
        default: 'active'
    },

    isGifTable: {
        type: Boolean,
        default: false
    },
    
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }

}, { timestamps: true });

productSchema.index({ title: 'text', shortDescription: 'text', tags: 'text' })

const Product = mongoose.model("Product", productSchema);

export {
    Product
}