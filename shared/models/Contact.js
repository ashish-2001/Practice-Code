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

    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seller",
        required: true
    },

    status: {
        type: String,
        enum: ["Pending", "Resolved"],
        default: "Pending"
    },

    message: {
        type: String,
        required: true
    }
    
}, { timestamps: true });

const Contact = mongoose.model("Contact", contactSchema);

export {
    Contact
}