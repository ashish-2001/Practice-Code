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

    sendBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seller"
    },

    message: {
        type: String,
        required: true
    }
});

const Contact = mongoose.model("Contact", contactSchema);

export {
    Contact
}