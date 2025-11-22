import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({

    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },

    code: {
        type: String,
        required: true,
        uppercase: true,
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
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

const Coupon = mongoose.model("Coupon", couponSchema);

export {
    Coupon
}