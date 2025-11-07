import { jwt, success, z } from "zod";
import { User } from "../models/Users";
import { Otp } from "../models/Otp";
import bcrypt from "bcrypt";
import { Profile } from "../models/Profile";
import otpGenerator from "otp-generator";
import dotenv, { parse } from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const signupValidator = z.object({
    firstName: z.string().min(1, "First name is required!"),
    lastName: z.string().min(1, "Last name is required!"),
    email: z.string().email(1, "Email is required!"),
    otp: z.string().length(6, "Ot is required!"),
    password: z.string().min(6, "Password is required!"),
    confirmPassword: z.string().min(6, "Confirm password is required!")
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match!",
    path: ["confirmPassword"]
});


async function signup(req, res){

    try{
        const parsedResult = signupValidator.safeParse(req.body);

        if(!parsedResult.success){
            return res.status(404).json({
                success: false,
                message: "All fields are required!"
            });
        }

        const {
            firstName,
            lastName,
            email,
            otp,
            password,
            confirmPassword
        } = parsedResult.data;

        if(password !== confirmPassword){
            return res.status(404).json({
                success: false,
                message: "Password and confirm password should be same!"
            });
        };

        const existingUser = await User.findOne({
            email
        });

        if(existingUser){
            return res.status(403).json({
                success: false, 
                message: "User already exists.Please Login to continue!"
            });
        };

        const otpRecord = await Otp.findOne({
            email,
            otp: otp.toString
        }).sort({
            createdAt: -1
        });

        if(!otpRecord || !otpRecord.otp !== otp.toString()){
            return res.status(404).json({
                success: false,
                message: "Invalid Otp!"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const profileDetails = await Profile.create({
            contactNumber: null,
            gender: null,
            dateOfBirth: null,
            bio: null
        });
        
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            additionalProfileDetails: profileDetails._id,
            image: ""
        });

        const token = jwt.sign({
            userId: user._id,
            email: user.email
        });

        return res.status(200).json({
            success: false,
            message: "User registered successfully!",
            token,
            user
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error
        });
    }
}

const signinValidator = z.object({
    email: z.string().email("Email is required!"),
    password: z.string().min(1, "Password is very small!")
});

async function signin(req, res){

    try{
        const parsedResult = signinValidator.safeParse(req.body);

        if(!parsedResult.success){
            return res.status(404).json({
                success: false,
                message: "ALl the fields are required!"
            });
        }

        const {
            password,
            email
        } = parsedResult.data;

        const user = await User.findOne({
            email
        }).populate("additionalProfileDetails");

        if(!user){
            return res.status(404).json({
                success: false,
                message: "User does not exists. Signup first!"
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if(isPasswordMatch){
            const token = jwt.sign({
                userId: user._id,
                email: user.email
            }, JWT_SECRET);

            user.token = token;
            user.password = undefined;

            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true
            }

            return res.cookie("token", token, options).status(200).json({
                success: true,
                message: "User logged in successfully!"
            });
        } else{
            return res.status(404).json({
                success: false,
                message: 'Password does not match!'
            });
        }
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error
        });
    }
};

const otpValidator = z.object({
    email: z.string().email("Email is required!")
});

async function sendOtp(req, res){

    try{
        const parsedResult = otpValidator.safeParse(req.body);

        if(!parsedResult.success){
            return res.status(404).json({
                success: false,
                message: "Input field is required!"
            });
        };

        const {
            email
        } = parsedResult.data;

        const checkUserPresent = await User.findOne({
            email
        });

        if(checkUserPresent){
            return res.status(404).json({
                success: false,
                message: "User already exists!"
            });
        }

        let otp;
        let otpExists;

        do{
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            },)

            otpExists = await Otp.findOne(
                otp);
        } while(otpExists);

        await Otp.create({
            email, 
            otp
        });

        return res.status(200).json({
            success: true,
            message: "Otp sent successfully!"
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
    oldPassword: z.string().min(1, "Old password is required!"),
    newPassword: z.string().min(1, "New password is required!"),
    confirmNewPassword: z.string().min(1, "Confirm new password is required!")
});

async function changePassword(req, res){

    try{

        const parsedResult = changePasswordValidator.safeParse(req.body);

        if(!parsedResult.success){
            return res.status(404).json({
                success: false,
                message: "All the fields are required!"
            });
        };

        const {
            oldPassword,
            newPassword,
            confirmNewPassword
        } = parsedResult.data;
        
        const userDetails = await User.findById(req.user.userId);

        if(!userDetails){
            return res.status(404).json({
                success: false,
                message: "User does not exists!"
            });
        }

        const isPasswordMatch = await bcrypt.compare(oldPassword, userDetails.password);

        if(oldPassword === newPassword){
            return res.status(404).json({
                success: false,
                message: "Old and new password should not be same!"
            });
        }

        if(!isPasswordMatch){
            return res.status(404).json({
                success: false,
                message: "You are giving incorrect old password!"
            });
        };


        if(newPassword !== confirmNewPassword){
            return res.status(404).json({
                success: false,
                message: "New password and confirm new password should be same!"
            });
        };

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updatedUserPassword = await User.findByIdAndUpdate(req.user.userId, {
            password: hashedPassword
        }, {
            new: true
        });

        try{
            const mailResponse = await mailSender(
                updatedUserPassword.email,
                "Password for your account has been updated.",
                passwordUpdate(
                    updatedUserPassword.email,
                    `Password updated for ${updatedUserPassword.firstName} ${updatedUserPassword.lastName}`
                )
            )

            console.log("Email sent successfully", mailResponse.response);
        }catch(error){
            return res.status(404).json({
                success: false,
                message: "Email not sent!",
                error
            })
        }

        return res.status(200).json({
            success: false,
            message: "Password updated successfully!"
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error
        });
    };
}

export {
    signup,
    signin,
    sendOtp,
    changePassword
}