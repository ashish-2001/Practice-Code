import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    firstName: {
        type: String,
        required: true,
        trim : true
    },

    lastName: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    contactNumber: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    profileImage: {
        type: String
    },

    role: {
        type: String,
        enum: ["Admin", "Seller", "Customer"],
        required: true
    },

    active: {
        type: Boolean,
        default: true
    },

    approved: {
        type: Boolean,
        default: true
    },
    
    emailVerified: {
        type: Boolean,
        default: false
    },

    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    }],

    token: {
        type: String
    },

    resetPasswordExpires: {
        type: Date
    },

    lastLogin: {
        type: Date,
        default: Date.now
    }

}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export {
    User
}