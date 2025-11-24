import z from "zod";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { mailSender } from "../utils/mailSender.js";
import bcrypt from "bcrypt";
import { Otp } from "../models/Otp.js";
import otpGenerator from "otp-generator";
import { ROLE_TYPE } from "../utils/constants.js";

import dotenv from "dotenv";
import { Order } from "../models/Order.js";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

function detectRole(req){
    const host = (req.headers.origin || req.headers.host || req.hostname || "").toString().toLowerCase();
    if(host.includes("http://localhost:5000/admin")) return "Admin";
    if(host.includes("http://localhost:5001/seller")) return "Seller";
    return "Customer";
}

const signupValidator = z.object({
    firstName: z.string().min(1, "First name is too small!"),
    lastName: z.string().min(1, "Last name is too small!"),
    email: z.string().email("Invalid email format!"),
    contactNumber: z.string().regex(/^(\+91)?[6-9]\d{9}$/, "Please enter a valid contact number!"),
    password: z.string().min(6, "Password must be of at least 6 characters!"),
    confirmPassword: z.string().min(6, "Confirm Password must be of at least 6 characters!"),
    otp: z.string().min(6, "Otp is required!"),
    profileImage: z.string().optional(),
});

async function signup(req, res){

    try{

        const parsedResult = signupValidator.safeParse(req.body);

        if(!parsedResult.success){
            return res.status(404).json({
                success: false,
                message: "All fields are required!"
            });
        };

        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            contactNumber,
            otp
        } = parsedResult.data;

        const role = detectRole(req);

        if(password !== confirmPassword){
            return res.status(404).json({
                success: false,
                message: "Password and confirm password should match!"
            })
        }

        const profileImage = req.files?.profileImage || "";

        const existingUser = await User.findOne({
            email,
            role
        });

        if(existingUser){
            return res.status(404).json({
                success: false,
                message: "User already exists!"
            });
        };

        const otpRecord = await Otp.findOne({
            email,
            role,
            otp: otp.toString()
        });

        if(!otpRecord || otpRecord.otp !== otp.toString()){
            return res.status(404).json({
                success: false,
                message: "Otp is invalid!"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            profileImage,
            contactNumber,
            role
        });

        await Otp.deleteOne({
            _id: otpRecord._id
        });

        const token = jwt.sign({
            userId: user._id,
            role: user.role,
            email: user.email
        }, JWT_SECRET);

        user.token = token;
        user.password = undefined;

        return res.status(200).json({
            success:true,
            message: "User registered successfully!",
            token,
            user
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error: error.message || error
        });
    };
};

const otpValidator = z.object({
    email: z.string().email("Invalid email format!")
});

async function sendOtp(req, res){

    try{

        const parsedResult = otpValidator.safeParse(req.body);

        if(!parsedResult.success){
            return res.status(404).json({
                success: false,
                message: "All fields are required!"
            });
        };

        const { email } = parsedResult.data;

        const role = detectRole(req);

        const checkUserPresent = await User.findOne({
            email,
            role
        });

        if(checkUserPresent){
            return res.status(404).json({
                success: false,
                message: "User already present!"
            });
        };

        let otp;
        let otpExists;

        do{
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
                digits: false
            });

            otpExists = await Otp.findOne({
                otp,
                role
            });
        } while( otpExists );

        await Otp.create({
            email,
            otp,
            role
        });

        return res.status(200).json({
            success: true,
            message: "Otp sent email successfully!"
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error
        });
    };
}

const signinValidator = z.object({
    email: z.string().email("Email format is incorrect!"),
    password: z.string().min(6, "Password is too small!")
});

async function signin(req, res){

    try{
        const parsedResult = signinValidator.safeParse(req.body);

        if(!parsedResult.success){
            return res.status(404).json({
                success: false,
                message: parsedResult.error.errors[0]?.message || "All fields are required!"
            });
        }

        const {
            email,
            password
        } = parsedResult.data;

        const role = detectRole(req);

        const user = await User.findOne({
            email,
            role
        });

        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found. Signup first to continue!"
            });
        };

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if(!isPasswordMatch){
            return res.status(404).json({
                success: false,
                message: "Incorrect password!"
            });
        };

        const token = jwt.sign({
            userId: user._id,
            email: user.email,
            role: user.role
        }, JWT_SECRET);

        user.token = token;
        user.password = undefined;

        res.cookie("token", token, {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            httpOnly: true
        });
        
        return res.status(200).json({
            success: true,
            message: "Logged in successfully!",
            token,
            user
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error
        });
    };
};

const changePasswordValidator = z.object({
    oldPassword: z.string().min(6, "Old password is incorrect!"),
    newPassword: z.string().min(6, "New password is incorrect!"),
    confirmPassword: z.string().min(6, "Confirm password is incorrect!")
});

async function changePassword(req, res){

    try{
        const parsedResult = changePasswordValidator.safeParse(req.body);

        if(!parsedResult.success){
            return res.status(404).json({
                success: false,
                message: "All fields are required!" 
            });
        };

        const {
            oldPassword,
            newPassword,
            confirmPassword
        } = parsedResult.data;

        const userId = req.user?.userId;

        const userDetails = await User.findById(userId);

        if(!userDetails){
            return res.status(404).json({
                success: false,
                message: "User not found. Signup first!"
            });
        };

        const isPasswordMatch = await bcrypt.compare(oldPassword, userDetails.password);

        if(!isPasswordMatch){
            return res.status(404).json({
                success: false,
                message: "Old password is incorrect!"
            });
        };

        if(oldPassword === newPassword){
            return res.status(404).json({
                success: false,
                message: "Old password can not be same as new password!"
            });
        };

        if(newPassword !== confirmPassword){
            return res.status(404).json({
                success: false,
                message: "New password and confirm new password should be same!"
            });
        };

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        const updatedUserDetails = await User.findByIdAndUpdate(
            userId,
            {
                password: hashedPassword
            },
            {
                new: true
            }
        );

        try{

            const mailResponse = await mailSender(
                updatedUserDetails.email,
                "Your password has been updated successfully!",
                updatedPassword(
                    updatedUserDetails.email,
                    `Password has been updated for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
                )
            );

            console.log("Mail Response:", mailResponse);

        } catch(error){
            return res.status(500).json({
                success: false,
                message: "Internal server error!",
                error
            });
        };

        return res.status(200).json({
            success: true,
            message: "Your password has been updated successfully!"
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error
        })
    }
}

async function adminDashboard(req, res){

    try{

        if(req.user.role !== "Admin"){
            return res.status(404).json({
                success: false,
                message: "Unauthorized!"
            });
        };

        const totalOrders = await Order.countDocuments();
        const revenueResult = await Order.aggregate([
            {
                $match: {
                    paymentStatus: "Paid"
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: "$totalAmount"
                    }
                }
            }
        ]);

        const totalRevenue = revenueResult[0]?.totalRevenue || 0;

        const pendingDeliveries = await Order.countDOcuments({
            orderStatus: {
                $in: ["Processing", "Shipped"]
            }
        });

        const totalCustomers = await User.countDocuments({ role: "Customer" });
        const totalSellers = await User.countDocuments({ role: "Seller" });

        return res.status(200).json({
            success: true,
            message: "Data fetched successfully!",
            totalOrders,
            totalCustomers,
            totalRevenue,
            totalSellers,
            pendingDeliveries
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Failed to load dashboard metrics!",
            error: error.message
        })
    }
}


export {
    signup,
    sendOtp,
    signin,
    changePassword,
    adminDashboard
}