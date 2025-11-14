import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    firstName: {
        type: String,
        required: true
    },

    lastName: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
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
    },

    token: {
        type: String
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