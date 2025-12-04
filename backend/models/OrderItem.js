import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({

    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },

    title: {
        type: String
    },

    price: {
        type: Number,
        required: true
    },

    quantity: {
        type: Number,
        required: true
    },

    total: {
        type: String,
        required: true
    },

    attributes: mongoose.Schema.Types.Mixed

}, { _id: false });

export {
    OrderItemSchema
}