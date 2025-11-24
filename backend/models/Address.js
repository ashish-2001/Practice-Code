import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    fullName: {
        type: String,
        required: true
    },

    contactNumber: {
        type: Number,
        required: true
    },

    addressLine1: {
        type: String,
        required: true,
        trim: true
    },

    addressLine2: {
        type: String,
        trim: true
    },

    landMark: {
        type: String,
        trim: true
    },

    city: {
        type: String,
        required: true
    },

    state: {
        type: String,
        required: true
    },

    country: {
        type: String,
        required: true
    },

    pinCode: {
        type: Number,
        required: true
    },

    addressType: {
        type: String,
        enum: ["Home", "Work"],
        default: "Home"
    },

    isDefault: {
        type: Boolean,
        default: false
    }
    
}, { timestamps: true });

const Address = mongoose.model("Address", addressSchema);

export {
    Address
}