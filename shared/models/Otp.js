import mongoose, { Error } from "mongoose";
import { otpTemplate } from "";
import { mailSender } from "";

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
        enum: ["Admin", "Seller", "Customer"],
        required: true
    }, 

    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 5
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
        throw new Error("Failed to send verification email!", error);
    }
}

otpSchema.pre("save", async function (next){
    console.log("New document saved to the database");

    if(this.isNew){
        await sendVerificationEmail(this.email, this.otp);
    }

    next();
});

const Otp = mongoose.model("Otp", otpSchema);

export {
    Otp
}