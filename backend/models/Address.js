import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    fullName: {
        type: String,
        required: true
    },

    contactNumber: {
        type: Number,
        required: true
    },

    pinCode: {
        type: Number,
        required: true
    },

    street: {
        type: String,
        required: true
    }, 

    city: {
        type: String,
        required: true
    },

    state: {
        type: String,
        required: true
    },

    country: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Address = mongoose.model("Address", addressSchema);

export {
    Address
}