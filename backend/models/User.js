import mongoose from "mongoose";
import { Address } from "./Address";

const UserSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },

    phone: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    profileImage: {
        type: String,
        default: null
    },

    role: {
        type: String,
        enum: ["Admin", "Customer"],
        required: true
    },

    dateOfBirth: {
        type: String,
        required: true
    },

    gender: {
        type: String,
        required: true
    },
    
    addresses: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address"
    },

    lastLogin: {
        type: Date,
        default: Date.now
    }

}, { timestamps: true });

const User = mongoose.model("User", UserSchema);

export {
    User
}