import z, { jwt } from "zod";
import { Admin } from "../models/Admin";
import bcrypt from "bcrypt";
import { Otp } from "../models/Otp";
import otpGenerator from "otp-generator";

const signupValidator = z.object({
    firstName: z.string().min(1, "First name is too small!"),
    lastName: z.string().min(1, "Last name is too small!"),
    email: z.string().email("Invalid email format!"),
    contactNumber: z.string().regex(/^(\+91)?[6-9]\d{9}$/, "Please enter a valid contact number!"),
    password: z.string().min(6, "Password is too small!"),
    confirmPassword: z.string().min(6, "Confirm Password is too small!"),
    otp: z.string().min(6, "Otp is invalid!"),
    profileImage: z.string().optional(),
    role: z.enum(["Admin"]).default("Admin")
});

const JWT_SECRET = process.env.JWT_SECRET;

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
            role,
            contactNumber,
            otp
        } = parsedResult.data;

        if(password !== confirmPassword){
            return res.status(404).json({
                success: false,
                message: "Password and confirm password should match!"
            })
        }

        const profileImage = req.files.profileImage;

        const existingAdmin = await Admin.findOne({
            email,
            role
        });

        if(existingAdmin){
            return res.status(404).json({
                success: false,
                message: "Admin already exists!"
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

        const admin = await Admin.create({
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
            adminId: admin._id,
            role: admin.role,
            email: admin.email
        }, JWT_SECRET);

        return res.status(200).json({
            success:true,
            message: "Admin registered successfully!",
            token,
            admin
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error
        });
    };
};

const otpValidator = z.object({
    email: z.string().email("Invalid email format!"),
    role: z.enum(["Admin"])
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

        const { email, role } = parsedResult.data;

        const checkAdminPresent = await Admin.findOne({
            email,
            role
        });

        if(checkAdminPresent){
            return res.status(404).json({
                success: false,
                message: "Admin already present!"
            });
        };

        let otp;
        let optExists;

        do{
            otp = otpGenerator.generate({
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            });

            optExists = await Otp.findOne({
                otp,
                role
            });
        } while( optExists );

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
            password,
            email
        } = parsedResult.data;

        const admin = await Admin.findOne({
            email
        });

        if(!admin){
            return res.status(404).json({
                success: false,
                message: "Admin not found. Signup first to continue!"
            });
        };

        const isPasswordMatch = await bcrypt.compare(password, admin.password);

        if(!isPasswordMatch){
            return res.status(404).json({
                success: false,
                message: "Incorrect password!"
            });
        };

        const token = jwt.sign({
            adminId: admin._id,
            email: admin.email,
            role: admin.role
        }, JWT_SECRET);

        admin.token = token;
        admin.password = undefined;

        const options = {
            expires: new Date(Date.now + 3 * 24 * 60 * 60 * 1000),
            httpOnly: true
        };

        res.cookie("token", token, options).status(200).json({
            success: true,
            message: "Admin logged in successfully!",
            token,
            admin
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

        const adminId = req.admin.adminId;

        const adminDetails = await Admin.findById(adminId);

        if(!adminDetails){
            return res.status(404).json({
                success: false,
                message: "Admin not found. Signup first!"
            });
        };

        const isPasswordMatch = await bcrypt.compare(oldPassword, adminDetails.password);

        if(!isPasswordMatch){
            return res.status(404).json({
                success: false,
                message: "Password is incorrect!"
            });
        };

        if(oldPassword === newPassword){
            return res.status(404).json({
                success: false,
                message: "Old password and new password should not be same!"
            });
        };

        if(newPassword !== confirmPassword){
            return res.status(404).json({
                success: false,
                message: "New password and confirm new password should be same!"
            });
        };

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        const updatedAdminDetails = await Admin.findByIdAndUpdate(
            adminId,
            {
                password: hashedPassword
            },
            {
                new: true
            }
        );

        try{

            const mailResponse = await mailSender(
                updatedAdminDetails.email,
                "Your password has been updated successfully!",
                updatedPassword(
                    updatedAdminDetails.email,
                    `Password has been updated for ${updatedAdminDetails.firstName} ${updatedAdminDetails.lastName}`
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

export {
    signup,
    sendOtp,
    signin,
    changePassword
}