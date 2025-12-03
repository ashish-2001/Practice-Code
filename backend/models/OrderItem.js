import mongoose from "mongoose";
import { Schema } from "zod/v3";

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
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

    attributes: Schema.Types.Mixed
}, { _id: false });

const OrderItem =  mongoose.model("OrderItem", orderItemSchema);

export {
    OrderItem
}