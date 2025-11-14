import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema({

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

    storeName: {
        type: String
    },

    role: {
        type: String,
        enum: ["Seller"],
        default: "Seller"
    },

    lastLogin: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Seller = mongoose.model("Seller", sellerSchema);

export {
    Seller
}

