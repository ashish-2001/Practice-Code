import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({

    firstName: {
        type: String,
        required: true
    },

    lastName: {
        type: String,
        required: true
    },

    contact: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
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

const Contact = mongoose.model("Contact", contactSchema);

export {
    Contact
}