import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    otp: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ["Admin"],
        required: true
    }
}, { timestamps: true });

const Otp = mongoose.model("Otp", otpSchema);

export {
    Otp
}