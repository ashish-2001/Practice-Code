import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({

    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },

    title: {
        type: String,
        trim: true
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    quantity: {
        type: Number,
        required: true,
        min: 1
    },

    total: {
        type: Number,
        required: true,
        min: 0
    },

    attributes: {
        type:  mongoose.Schema.Types.ObjectId,
        default: {}
    }

}, { _id: false });

export {
    OrderItemSchema
}