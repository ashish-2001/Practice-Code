import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({

    code: {
        type: String,
        required: true,
        unique: true
    },

    discountType: {
        type: String,
        enum: ["Flat", "Percentage"],
        required: true
    },

    discountValue: {
        type: Number,
        required: true
    }, 

    minOrderAmount: {
        type: Number,
        default: 0
    },

    maxDiscount: {
        type: Number
    }, 

    expiry: {
        type: Date,
        required: true
    },

    active: {
        type: Boolean,
        required: true
    }
}, { timestamps: true });

const Coupon = mongoose.model("Coupon", couponSchema);

export {
    Coupon
}