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
        required: true,
        validate: {
            validator: (v) => v > Date.now(),
            message: "Expiry date must be in future!"
        }
    },

    active: {
        type: Boolean,
        default: true,
        required: true
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    role: {
        type: String,
        enum: ["Admin", "Customer"],
        required: true
    }
}, { timestamps: true });

const Coupon = mongoose.model("Coupon", couponSchema);

export {
    Coupon
}