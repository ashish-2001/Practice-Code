import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({

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
        type: Number,
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
        enum: ["Admin"],
        default: "Admin"
    },

    lastLogin: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Admin = mongoose.model("Admin", adminSchema);

export {
    Admin
}