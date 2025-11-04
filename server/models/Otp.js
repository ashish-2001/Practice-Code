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
    
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 10
    }

});

const Otp = mongoose.model("Otp", otpSchema);

export {
    Otp
}