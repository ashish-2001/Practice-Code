import mongoose from "mongoose";

const ContactFormSchema = new mongoose.Schema({

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
        required: true
    },

    contactNumber: {
        type: Number,
        required: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    message: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ["Pending", "Resolved"],
        default: "Pending"
    }
    
}, { timestamps: true });

const Contact = mongoose.model("Contact", ContactFormSchema);

export {
    Contact
}