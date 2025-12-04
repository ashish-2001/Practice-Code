import mongoose from "mongoose"

const StockHistorySchema = new mongoose.Schema({

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

const StockHistory = mongoose.model("StockHistory", StockHistorySchema);

export {
    StockHistory
}