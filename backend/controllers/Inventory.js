import z from "zod";
import { Product } from "../models/Product";
import { Inventory } from "../models/Inventory";
import { User } from "../models/User";
import mongoose from "mongoose";

const inventoryValidator = z.object({
    productId: z.string().min(1, "Product id is required!"),
    change: z.number().min(1, "Inventory is required!"),
    reason: z.enum(["Purchase", "Order Cancelled", "Stock update"]),
})

async function createInventory(req, res){

    const session = await mongoose.startSession();
    session.startTransaction();

    try{

        const parsedResult = inventoryValidator.safeParse(req.body);

        if(!parsedResult.success){
            return res.status(403).json({
                success: false,
                message: "All fields are required!"
            });
        };

        const {
            productId,
            reason,
            change
        } = parsedResult.data;

        const productData = await Product.findById(productId).session(session);

        if(!productData){
            return res.status(404).json({
                success: false,
                message: "Product not found!"
            });
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
            await session.abortTransaction();
            return res.status(403).json({
                success: false,
                message: "Stock cannot be negative!"
            });
        };

        await productData.save({ session });

        const inventory = await Inventory.create([{
            product: productId,
            reason,
            change
        }], { session });

        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            message: "Inventory created successfully!",
            inventory: inventory[0],
            product: productData
        });
    }catch(error){

        await session.abortTransaction();
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error: error.message
        });
    } finally{
        session.endSession();
    };
};

async function getAllInventory(req, res){

    try{

        let inventoryLogs;
        if(req.user.role === "Admin"){

            inventoryLogs = await Inventory.find()
            .populate("user", "firstName lastName email role")
            .populate({
                path: "product", 
                select: "productName productStock category productPrice user",
                populate: [
                    {
                        path: "category",
                        select: "categoryName"
                    },
                    {
                        path: "user",
                        select: "firstName lastName email role"
                    }
                ]
            });
        }

        else{
            return res.status(403).json({
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

async function getProductInventory(req, res){

    try{
        const adminId = req.params._id;

        const inventoryLogs = await Inventory.find({ user: adminId }).populate("product").sort({ editedAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Admin data fetched successfully!",
            inventoryLogs
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error: error.message
        });
    };

}


async function editInventory(req, res){
    const session = await mongoose.startSession();
    session.startTransaction();

    try{
        const inventoryId = req.params.id;

        const parsedResult = inventoryValidator.safeParse(req.body);

        if(!parsedResult.success){
            return res.status(403).json({
                success: false,
                message: "All fields are required!"
            });
        };

        const { change, reason } = parsedResult.data;

        const oldInventory = await Inventory.findById(inventoryId).session(session);

        if(!oldInventory){
            return res.status(400).json({
                success: false,
                message: "Inventory not found!"
            });
        };

        const productData = await Product.findById(oldInventory.product).session(session);

        if(!productData){
            return res.status(403).json({
                success: false,
                message: "Product not found!"
            });
        };

        if(req.user.role !== "Admin" && req.user._id.toString() !== oldInventory.user.toString()){
            return res.status(403).json({
                success: false,
                message: "You can not edit another admin's inventory!"
            });
        }

        if(oldInventory.reason == "Purchase"){
            productData.productStock += oldInventory.change;
        }

        else if(oldInventory.reason === "Order Cancelled"){
            productData.productStock -= oldInventory.change
        }

        else if(oldInventory.reason == "Stock update"){
            productData.productStock -= productData.change
        }

        if(reason == "Purchase"){
            productData.productStock -= change
        }

        else if(reason == "Order Cancelled"){
            productData.productStock += change
        }

        else if(reason == "Stock update"){
            productData.productStock += change
        };

        if(productData.productStock < 0){
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: "Product stock can not be negative!"
            });
        };

        await productData.save({ session });

        oldInventory.change = change;
        oldInventory.reason = reason;
        oldInventory.editedAt = new Date()

        await oldInventory.save({ session });
        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            message: "Inventory updated successfully!",
            product: productData,
            inventory: oldInventory
        });
    } catch(error){
        await session.abortTransaction();
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error: error.message
        });
    } finally{
        session.endSession();
    }
}

export {
    createInventory,
    getAllInventory,
    getProductInventory,
    editInventory
}