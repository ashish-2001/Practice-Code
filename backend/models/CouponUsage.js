import mongoose from "mongoose";

const CouponUsageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coupon",
        required: true
    },

    usedCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

CouponUsageSchema.index({ user: 1, coupon: 1 }, { unique: true });

const CouponUsage = mongoose.model("CouponUsage", CouponUsageSchema);

export {
    CouponUsage
}