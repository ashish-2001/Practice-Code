import mongoose from "mongoose"
import { Schema } from "zod";

const stockHistorySchema = new Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        index: true
    },

    change: {
        type: Number,
        required: true
    },

    reason: {
        type: String,
        enum: ['Initial', 'Purchase', 'Sale', 'Return', 'Order cancelled', 'Manual Adjustment'],
        default: 'Sale'
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const StockHistory = mongoose.model("StockHistory", stockHistorySchema);

export {
    StockHistory
}