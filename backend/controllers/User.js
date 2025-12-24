import z, { map } from "zod";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { mailSender } from "../utils/mailSender.js";
import bcrypt from "bcrypt";
import { Otp } from "../models/Otp.js";
import otpGenerator from "otp-generator";
import dotenv from "dotenv";
import { Order } from "../models/Order.js";
import { ACCOUNT_TYPE } from "../utils"
import { uploadImageToCloudinary } from "../utils/imageUploader.js";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if(JWT_SECRET){
    console.warn("Warning: JWT_SECRET is not in environment variables.");
};

const signupValidator = z.object({
    name: z.string().min(1, "Name is required!"),
    email: z.string().email("Invalid email format!"),
    phone: z.string().regex(/^(\+91)?[6-9]\d{9}$/, "Please enter a valid contact number!"),
    password: z.string().min(6, "Password must be of at least 6 characters!"),
    confirmPassword: z.string().min(6, "Confirm Password must be of at least 6 characters!"),
    role: z.enum([ACCOUNT_TYPE.CUSTOMER, ACCOUNT_TYPE.ADMIN]),
    gender: z.string().optional(),
    dateOfBirth: z.string().optional(),
    otp: z.string().min(6, "Otp is required!")
});

const updateProfileValidator = z.object({
    name: z.string().min(1, "Name is required"),
    gender: z.enum(["Male", "Female"]),
    dateOfBirth: z.string().optional(),
    phone: z.string().regex(/^[0-9]{10}$/, "Phone number is required")
});

async function signup(req, res){

    try{

        const parsedResult = signupValidator.safeParse(req.body) ;

        if(parsedResult.success){
            return res.status(403).json({
                success: false,
                message: "All fields are required!"
            });
        };

        const {
            name,
            email,
            phone,
            password,
            confirmPassword,
            role,
            dateOfBirth,
            gender,
            otp
        } = parsedResult.data;

        const existingUser = await User.findOne({
            email,
            role
        });

        if(password !== confirmPassword){
            return res.status(402).json({
                success: true,
                message: "Password and confirm password should be equal!"
            })
        }

        if(existingUser){
            return res.status(402).json({
                success: false,
                message: "User already exists!"
            });
        };

        const profileImage = req.files.profileImage;
        
        const otpRecord = await Otp.findOne({
            email,
            role,
            otp: otp.toString()
        }).sort({ createdAt: -1 });

        if(!otpRecord || otpRecord.otp !== otp.toString()){
            return res.status(403).json({
                success: false,
                message: "Invalid otp!"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name,
            email: email,
            phone: phone,
            password: hashedPassword,
            dateOfBirth,
            gender,
            role: role,
            profileImage: profileImage
        });

        await Otp.deleteMany({
            _id: otpRecord._id
        })

        const token = await jwt.sign({
            userId: req.user._id,
            role: user._id,
            email: user._id
        }, JWT_SECRET);

        user.password = undefined;

        return res.status(200).json({
            success: true,
            message: "User registered successfully!",
            token,
            user
        });

    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Interval server error!",
            error: error.message
        });
    };
};

const otpValidator = z.object({
    email: z.string().email("Invalid email format!"),
    role: z.enum([ACCOUNT_TYPE.CUSTOMER, ACCOUNT_TYPE.ADMIN])
});

async function sendOtp(req, res){

    try{

        const parsedResult = otpValidator.safeParse(req.body);

        if(!parsedResult.success){
            return res.status(404).json({
                success: false,
                message: "Email is required!"
            });
        };

        const { email, role } = parsedResult.data;

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
            otp = otpGenerator.generate({
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            });

            otpExists = await Otp.findOne({
                otp,
                role
            });
        } while( otpExists );

        await Otp.deleteMany({
            email,
            otp,
            role 
        });

        const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

        await Otp.create({
            email,
            otp,
            role,
            expiresAt
        });

        return res.status(200).json({
            success: true,
            message: "Otp sent to email successfully!",
            otp
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error: error.message
        });
    };
};

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

        const user = await User.findOne({
            email
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

        user.password = undefined;

        res.cookie("token", token, {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            httpOnly: true,
            sameSite: "lax"
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
            error: error.message
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
            return res.status(403).json({
                success: false,
                message: "All fields are required!"
            });
        }

        const { oldPassword, newPassword, confirmPassword } = parsedResult.data;

        if(newPassword !== confirmPassword){
            return res.status(402).json({
                success: true,
                message: "new password and confirm password should be equal!"
            });
        };

        const userId = req.user.userId;

        const userDetails = await User.findById(userId);

        if(oldPassword === newPassword){
            return res.status(403).json({
                success: false,
                message: "Old password and new password should not be equal!"
            });
        };

        const isPasswordMatch = await bcrypt.compare(oldPassword, userDetails.password);

        if(!isPasswordMatch){
            return res.status(403).json({
                success: false,
                message: "Password does not match"
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
        )
        try{

            const mailResponse = await mailSender(
                updatedUserDetails.email,
                "Your password has been updated successfully!",
                passwordUpdate(
                    updatedUserDetails.email,
                    `Password has been updated for ${updatedUserDetails.name}`
                )
            );

            console.log("Mail Response:", mailResponse);

        } catch(error){
            return res.status(500).json({
                success: false,
                message: "Internal server error!",
                error: error.message
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

        if(!req.user || req.user.role !== "Admin"){
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

        const pendingDeliveries = await Order.countDocuments({
            orderStatus: {
                $in: ["Processing", "Shipped"]
            }
        });

        const totalCustomers = await User.countDocuments({ role: "Customer" });

        return res.status(200).json({
            success: true,
            message: "Data fetched successfully!",
            totalOrders,
            totalCustomers,
            totalRevenue,
            pendingDeliveries
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Failed to load dashboard metrics!",
            error: error.message
        });
    };
};

async function updateProfile(req, res){

    try{

        const parsedResult = updateProfileValidator.safeParse(req.body);

        if(!parsedResult.success){
            return res.status(400).json({
                success: false,
                message: "All fields are required!"
            });
        };

        const { name, dateOfBirth, gender, phone } = parsedResult.data;

        const userId = req.user._id;

        const profileDetails = await User.findById(userId);

        if(!profileDetails){
            return res.status(404).json({
                success: false,
                message: "User not found!"
            });
        };

        const updatedUser = await User.findByIdAndUpdate(userId, {
            name,
            phone,
            dateOfBirth,
            gender
        });

        if(!updatedUser){
            return res.status(400).json({
                success: false,
                message: "User cannot be updated successfully!"
            });
        };

        return res.status(200).json({
            success: false,
            message: "Profile updated successfully",
            updatedUser
        });
    } catch(e){
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: e.message
        });
    };
};

async function updateDisplayPicture(req, res){

    try{
        const profileImage = req.files?.profileImage;

        const userId = req.user?._id;

        const uploadedImage = await uploadImageToCloudinary(
            profileImage,
            process.env.FOLDER_NAME,
            1000,
            1000
        )

        console.log("Profile Image:-", uploadedImage);

        const updatedProfile = await User.findByIdAndUpdate(
            userId, {
                profileImage: uploadedImage.secure_url
            }, {
                new: true
            }
        );

        if(!profileImage){
            return res.status(404).json({
                success: false,
                message: "Image not found"
            });
        };

        return res.status(200).json({
            success: false,
            message: "Profile image updated successfully!",
            updatedProfile
        });

    } catch(e){
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: e.message
        })
    }
}

const deleteAccountValidator = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user id")
});

async function deleteAccount(req, res){

    try{
        const parsedResult = deleteAccountValidator.safeParse(req.body);

        if(!parsedResult.success){
            return res.status(400).json({
                success: false,
                message: "Invalid user id"
            });
        };

        const userId = req.user?._id;

        const userDetails = await User.findById({ _id: userId });

        if(!userDetails){
            return res.status(404).json({
                success: false,
                message: "User not found!"
            });
        };

        await User.findByIdAndDelete({ _id: userId });

        return res.status(200).json({
            success: false,
            message: "Account deleted successfully!"
        });
    } catch(e){
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: e.message
        })
    }
}

async function getAllUserDetails(req, res){
    try{
        const userId = req.user._id;

        const userDetails = await User.findById(userId).sort({ createdAt: -1 });

        if(!userDetails){
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        };

        return res.status(200).json({
            success: false,
            message: "User data fetched successfully!"
        });
    } catch(e){
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: e.message
        })
    }
}

async function getPurchasedProducts(req, res){
    try{

        const userId = req.user._id;

        if(!userId){
            return res.status(403).json({
                success: false,
                message: "User not found!"
            });
        };

        const orders = await Order.find({
            user: userId,
            paymentStatus: "Paid"
        })
        .populate("items.product", "productName price productImage")
        .sort({ createdAt: -1 });

        if(!orders.length){
            return res.status(200).json({
                success: true,
                message: "No purchased products found",
                products: []
            })
        };

        const productMap = new map();

        orders.forEach(order => {
            order.items.forEach(item => {
                const productId = item.product._id.toString();

                if(!productMap.has(productId)){
                    productMap.set(productId, {
                        _id: item.product._id,
                        name: item.product.productName,
                        image: item.product.imageName,
                        price: item.price,
                        totalQuantity: item.quantity,
                        lastPurchasedAt: order.createdAt
                    })
                } else{
                    productMap.get(productId).totalQuantity += item.quantity
                }
            })
        });

        return res.status(200).json({
            success: true,
            message: "Purchased product fetched successfully",
            count: productMap.size,
            products: Array.from(productMap.values())
        })
        } catch(e){
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: e.message
        });
    };
};

export {
    signup,
    sendOtp,
    signin,
    changePassword,
    adminDashboard,
    updateProfile,
    updateDisplayPicture,
    deleteAccount,
    getAllUserDetails,
    getPurchasedProducts
};