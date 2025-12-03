import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    
    code: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
        unique: true
    },

    description: {
        type: String
    },

    discountType: {
        type: String,
        enum: ["Fixed", "Percent"],
        required: true
    },

    discountValue: {
        type: Number,
        required: true
    }, 

    minPurchase: {
        type: Number,
        default: 0
    },

    usageLimit: {
        type: Number,
        default: null
    },

    usedCount: {
        type: Number,
        default: 0
    },

    perUserLimit: {
        type: Number,
        default: 1
    },

    validFrom: {
        type: Date,
        default: Date.now
    },

    validUntil: {
        type: Date,
        default: null
    },

    active: {
        type: Boolean,
        default: true
    },

    appliesTo: {
        type: String,
        enum: ['all', 'categories', 'products'],
        default: 'all'
    },

    appliesIds: {
        type: mongoose.Schema.Types.ObjectId
    }
}, { timestamps: true });

couponSchema.index({ code: 1 });

const Coupon = mongoose.model("Coupon", couponSchema);

export {
    Coupon
}