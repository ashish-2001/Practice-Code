import z from "zod";
import { Product } from "../models/Product";
import { Inventory } from "../models/Inventory";
import { User } from "../models/User";

const inventoryValidator = z.object({
    product: z.string().min(1, "Product id is required!"),
    change: z.number().min(1, "Inventory is required!"),
    reason: z.enum(["Purchase", "Order Cancelled", "Stock update"]),
})

async function createInventory(req, res){

    try{

        const parsedResult = inventoryValidator.safeParse(req.body);

        if(!parsedResult.success){
            return res.status(403).json({
                success: false,
                message: "All fields are required!"
            });
        };

        const {
            product,
            reason,
            change
        } = parsedResult.data;

        const userId = req.user._id;

        const user = await User.findById(userId);

        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found!"
            });
        };

        const productData = await Product.findById(product);

        if(!productData){
            return res.status(404).json({
                success: false,
                message: "Product not found!"
            });
        };

        if(req.user.role === "Seller"){
            if(String(productData.createdBy) !== String(req.user._id)){
                return res.status(403).json({
                    success: false,
                    message: "User cannot update another's product data!"
                });
            };
        };

        if(reason === "Purchase"){
            productData.productStock -= change;
        }

        if(reason === "Order cancelled"){
            productData.productStock += change;
        }

        if(reason === "Stock update"){
            productData.productStock += change;
        }

        if(productData.productStock < 0){
            return res.status(403).json({
                success: false,
                message: "Product stock cannot be negative!"
            });
        };

        const inventoryLog = await Inventory.create({
            createdBy: userId,
            product,
            reason,
            change
        });

        if(!inventoryLog){
            return res.status(403).json({
                success: false,
                message: "Inventory not created!"
            });
        };

        return res.status(200).json({
            success: true,
            message: "Inventory created successfully!",
            inventory: inventoryLog,
            product: productData
        });
    }catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error: error.message
        });
    };
};

async function getAllInventory(req, res){

    try{

        let inventoryLogs;
        if(req.user.role === "Admin"){

            inventoryLogs = await Inventory.find()
            .populate("createdBy", "firstName lastName email role")
            .populate({
                path: "product", 
                select: "productName productStock category productPrice createdBy",
                populate: [
                    {
                        path: "category",
                        select: "categoryName"
                    },
                    {
                        path: "createdBy",
                        select: "firstName lastName email role"
                    }
                ]
            });
        }

        else if(req.user.role === "Seller"){
            const sellerProducts = await Product.find({
                createdBy: req.user._id
            }).select("_id");

            const sellerProductIds = sellerProducts.map((p) => p._id);

            inventoryLogs = await Inventory.find({
                product:{
                    $in: sellerProductIds
                }
            })
            .populate("createdBy", "firstName lastName email role")
            .populate({
                path: "product", 
                select: "productName productStock category productPrice createdBy",
                populate: [
                    {
                        path: "category",
                        select: "categoryName"
                    },
                    {
                        path: "createdBy",
                        select: "firstName lastName email role" 
                    }
                ]
            });
        }

        else{
            return res.status(402).json({
                success: false,
                message: "YOu are not allowed to access inventory logs!"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Inventory data fetched successfully",
            count: inventoryLogs.length,
            inventory: inventoryLogs
        })
    }catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error: error.message
        });
    }
}

async function editInventory(req, res){
    
    const inventoryId = req.params.id;

    const parsedResult = inventoryValidator.safeParse(req.body);

    if(!parsedResult.success){
        return res.status(403).json({
            success: false,
            message: "All fields are required!"
        });
    };

    const { product, change, reason } = parsedResult.data;

    const oldInventory = await Inventory.findById(inventoryId);

    if(!oldInventory){
        return res.status(400).json({
            success: false,
            message: "Inventory not found!"
        });
    };

    const productData = await Product.findById(oldInventory.product);

    if(!productData){
        return res.status(403).json({
            success: false,
            message: "Product not found!"
        });
    };

    if(req.user.role === "Seller"){
        if(String(productData.createdBy) !== String(req.user._id)){
            return res.status(403).json({
                success: false,
                message: "You can not delete another seller's inventory!"
            });
        }
    }

    if(oldInventory.reason == "Purchase"){
        productData.productStock += oldInventory.change;
    }

    if(oldInventory.reason === "Order Cancelled"){
        productData.productStock -= productData.change
    }

    if(oldInventory.reason == "Stock update"){
        productData.productStock -= productData.change
    }

    if(reason == "Purchase"){
        productData.productStock -= change
    }

    if(reason == "Order Cancelled"){
        productData.productStock += change
    }

    if(reason == "Stock update"){
        productData.productStock += change
    };

    if(productData.productStock < 0){
        return res.status(404).json({
            success: false,
            message: "Product stock can not be negative!"
        });
    };

    await productData.save();

    oldInventory.product = product;
    oldInventory.reason = reason;
    oldInventory.change = change;
    oldInventory.editedAt = new Date();

    await oldInventory.save();

    return res.status(200).json({
        success: false,
        message: "Inventory updated successfully!"
    });
}

export {
    createInventory,
    getAllInventory,
    editInventory
}