import z from "zod";
import { User } from "../models/User.js";
import { mailSender } from "../utils/mailSender.js";
import bcrypt from "bcrypt";

const resetPasswordTokenValidator = z.object({
    email: z.string().email("Invalid email format!")
});

async function resetPasswordToken(req, res){

    try{

        const parsedResult = resetPasswordTokenValidator.safeParse(req.body);

        if(!parsedResult.success){
            return res.status(402).json({
                success: false,
                message: "Email is required!"
            });
        };

        const{ email } = parsedResult.data;

        const user = await User.findOne({
            email: email
        });

        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found!"
            });
        };

        const token = crypto.randomBytes(20).toString("hex");

        const updatedUser = await User.findOneAndUpdate({
            email: email
        }, {
            token: token,
            resetPasswordExpires: Date.now() + 3600000
        }, {
            new: true
        });

        const url = `http://localhost:3000/update-password/${token}`

        await mailSender(
            email,
            "Reset Password email",
            `Link for email verification is ${url}.To reset your password click on the link.`
        );

        return res.status(200).json({
            success: true,
            message: "Password updated successfully!",
            data: updatedUser
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error
        });
    };
};

const resetPasswordValidator = z.object({
    password: z.string().min(6, "Password is required!"),
    confirmPassword: z.string().min(6, "Confirm password is required!"),
    token: z.string().min(1, "Token is required!")
});

async function resetPassword(req, res){

    try{
        
        const parsedResult = resetPasswordValidator.safeParse(req.body);

        if(!parsedResult.success){
            return res.status(402).json({
                success: false,
                message: "All fields are required!"
            });
        };

        const {
            password,
            confirmPassword,
            token
        } = parsedResult.data;

        if(password !== confirmPassword){
            return res.status(402).json({
                success: false,
                message: "Password and confirm password does not match!"
            });
        };

        const user = await User.findOne({
            token: token
        });

        if(!user){
            return res.status(404).json({
                success: false,
                message: "Invalid or expired token!"
            });
        };

        if(user.resetPasswordExpires && user.resetPasswordExpires < Date.now()){
            return res.status(410).json({
                success: false,
                message: "Reset token has expired! Please request a new one."
            })
        };

        const hashedPassword = await bcrypt.hash(password, 10);

        const updatedUser = await User.findOneAndUpdate(
            {
                token: token
            },
            {
                password: hashedPassword,
                token: null,
                resetPasswordExpires: null
            },
            {
                new: true
            }
        );

        return res.status(200).json({
            success: true,
            message: "Password updated successfully!",
            data: updatedUser
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error
        });
    };
};

export {
    resetPasswordToken,
    resetPassword
}