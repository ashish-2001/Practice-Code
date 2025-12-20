import mongoose from "mongoose";

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
        trim: true
    },

    phone: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    confirmPassword: {
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

    addresses: [
        {
            label: {
                type: String
            },

            name: String,
            phone: String,
            addressLine1: String,
            addressLine2: String,
            city: String,
            state: String,
            postalCode: String,
            country: {
                type: String,
                default: 'Bharat'
            }
        }
    ],

    lastLogin: {
        type: Date,
        default: Date.now
    }

}, { timestamps: true });

const User = mongoose.model("User", UserSchema);

export {
    User
}