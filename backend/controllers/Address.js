import z from "zod";
import { Address } from "../models/Address";

const addressValidator = z.object({
    fullName: z.string().min(3, "Full name is required!"),
    contactNumber: z.string().min(10).max(12),
    addressLine1: z.string().min(3),
    addressLine2: z.string().min(3),
    landMark: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    country: z.string().min(6),
    addressType: z.enum(["Home", "Work"]).default("Home"),
    isDefault: z.boolean().optional(),
    pinCode: z.string().min(6).max(6)
});

async function createAddress(req, res){

    try{

        if(req.user.role !== "Customer"){
            return res.status(403).json({
                success: false,
                message: "Only customer can create address!"
            })
        }
        
        const parsedResult = addressValidator.safeParse(req.body);

        if(!parsedResult.success){
            return res.status(403).json({
                success: false,
                message: "All fields are required!"
            });
        };

        const userId = req.user._id;

        const data = parsedResult.data;

        if(data.isDefault){
            await Address.updateMany(
                {
                    user: userId,
                },
                {
                    $set: {
                        isDefault: false
                    }
                }
            )
        }

        const address = await Address.create({
            user: userId,
            fullName: data.fullName,
            contactNumber: data.contactNumber,
            addressLine1: data.addressLine1,
            addressLine2: data.addressLine2 || "",
            landMark: data.landMark || "",
            city: data.city,
            state: data.state,
            country: data.country,
            pinCode: data.pinCode,
            addressType: data.addressType,
            isDefault: data.isDefault || false
        });

        return res.status(200).json({
            success: true,
            message: "Address created successfully!",
            address
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error: error.message
        })
    }
}

async function getAllAddress(req, res){

    try{
        if(req.user.role !== "Customer"){
            return res.status(403).json({
                success: false,
                message: "Only customers can view their address!"
            });
        }

        const userId = req.user._id;

        const addresses = await Address.find({
            user: userId
        }).sort({ isDefault: -1, createdAt: -1 });

        return res.status(200).json({
            success: false,
            message: "All the address has been fetched successfully!",
            addresses
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Interval server error!",
            error: error.message
        });
    }
}

async function getSingleAddress(req, res){
    try{
        if(req.user.role !== "Customer"){
            return res.status(403).json({
                success: false,
                message: "Only customers can view address"
            })
        }

        const address = await Address.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        return res.status(200).json({
            success: true,
            message: "Data fetched successfully!",
            address
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error: error.message
        })
    }
}

async function getUserAddress(req, res){

    try{
        if(req.user.role !== "Admin"){
            return res.status(403).json({
                success: false,
                message: "Only admin can view customer address!"
            });
        };

        const addresses = await Address.find({ user: req.params.userId }).sort({ isDefault: -1, createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Data fetched successfully!",
            addresses
        })
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error: error.message
        })
    }
}

export {
    createAddress,
    getAllAddress,
    getSingleAddress,
    getUserAddress
}