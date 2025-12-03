import mongoose from "mongoose";
import { Schema } from "zod/v3";

const inventorySchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },

    sku: {
        type: String,
    },

    attributes: Schema.Types.Mixed,

    stock: {
        type: Number,
        required: true,
        default: 0
    },

    history: [
        {
            quantity: Number,
            type: {
                type: String,
                enum: ['Increase', 'Decrease']
            },

            reason: String,
            date: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, { timestamps: true });

const Inventory = mongoose.model("Inventory", inventorySchema);

export {
    Inventory
}