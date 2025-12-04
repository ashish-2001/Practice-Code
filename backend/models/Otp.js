import mongoose, { Error } from "mongoose";
import { otpTemplate } from "../mail/templates/emailVerificationTemplate.js";
import { mailSender } from "../utils/mailSender.js";

const OtpSchema = new mongoose.Schema({
    
    otp: {
        type: String 
    },

    email: {
        type: String
    },

    role: {
        type: String,
        enum: ["Admin", "Customer"]
    }, 

    expiresAt: {
        type: Date,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

async function sendVerificationEmail(email, otp){

    try{
        const mailResponse = await mailSender(
            email,
            "Email Verification",
            otpTemplate(otp)
        )

        console.log("Mail response:", mailResponse);
    } catch(error){
        throw new Error("Failed to send verification email: " + error.message);
    }
}

OtpSchema.pre("save", async function (next){
    console.log("New document saved to the database");

    if(this.isNew){
        await sendVerificationEmail(this.email, this.otp);
    }

    next();
});

const Otp = mongoose.model("Otp", OtpSchema);

export {
    Otp
}