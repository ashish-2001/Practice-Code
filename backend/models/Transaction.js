import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({

    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        index: true
    },

    amount: {
        type: Number,
        required: true
    },

    method: {
        type: String,
        enum: ['Razorpay', 'Stripe', 'Paypal', 'Upi', 'Wallet', 'COD', 'NetBanking', 'Other'],
        default: 'Razorpay'
    },

    status: {
        type: String,
        enum:['Created', 'Success', 'Failed', 'Refunded'],
        default: 'Created'
    },

    txnId: {
        type: String
    },

    providerResponse: mongoose.Schema.Types.Mixed,

    createdAt: {
        type: Date,
        default: Date.now
    }
    
}, { timestamps: true });

const Transaction = mongoose.model("Transaction", TransactionSchema);

export {
    Transaction
};