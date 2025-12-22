import z from "zod";
import { Product } from "../models/Product";
import { Inventory } from "../models/Inventory";
import mongoose from "mongoose";

const inventoryValidator = z.object({
    productId: z.string().min(1, "Product id is required!"),
    change: z.number().min(1, "Inventory is required!"),
    reason: z.enum(["Purchase", "Order Cancelled", "Stock update"]),
})

async function createInventory(req, res){

    if(!req.user || req.user.role !== "Admin"){
        return res.status(403).json({
            success: false,
            message: "Only admin can create inventory"
        })
    }

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

        const product = await Product.findById(productId).session(session);

        if(!product){
            return res.status(404).json({
                success: false,
                message: "Product not found!"
            });
        };

        if(reason === "Purchase"){
            product.productStock -= change;
        } else{
            product.productStock += change;
        }

        if(product.productStock < 0){
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Stock can not be negative"
            });
        };

        await product.save({ session });

        const inventory = await Inventory.create([
            {
                product: productId,
                user: req.user._id,
                reason,
                change
            }
        ], { session });

        await session.commitTransaction();

        return res.status(201).json({
            success: true,
            message: "Inventory created successfully",
            inventory: inventory[0],
            product
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

    if(!req.user || req.user._id !== "Admin"){
        return res.status(403).json({
            success: false,
            message: "Only admin can view inventory logs"
        })
    }

    try{
            const inventoryLogs = await Inventory.find()
            .populate({
                path: "product", 
                select: "_id productName productStock productPrice category",
                populate: 
                    {
                        path: "category",
                        select: "categoryName"
                    } 
            }).populate({
                path: "user",
                select: "_id name email role"
            }).sort({ createdAt: -1 });

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
        
        if(!req.user || req.user._id !== "Admin"){
            return res.status(403).json({
                success: false,
                message: "Only admin can access product inventory"
            })
        };

        const { productId } = req.params;

        if(!mongoose.Types.ObjectId.isValid(productId)){
            return res.status(400).json({
                success: false,
                message: "Invalid product id"
            });
        };

        const inventoryLogs = await Inventory.find({ product: productId })
            .populate({
                path: "product",
                select: "_id productName productPrice productStock"
            })
            .populate({
                path: "user",
                select: "_id name email role"
            }).sort({ createdAt: -1 });

            if(!inventoryLogs || inventoryLogs.length === 0){
                return res.status(404).json({
                    success: false,
                    message: "No inventory found for this product"
                })
            };

        return res.status(200).json({
            success: true,
            message: "Admin data fetched successfully!",
            product: inventoryLogs[0].products,
            inventoryLogs
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error: error.message
        });
    };
};


async function editInventory(req, res){
    const session = await mongoose.startSession();
    session.startTransaction();

    try{

        if(!req.user || req.user.role !== "Admin"){
            return res.status(403).json({
                success: false,
                message: "Only admin can edit the inventory"
            })
        }
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
            return res.status(404).json({
                success: false,
                message: "Product not found!"
            });
        };

        if(oldInventory.reason == "Purchase"){
            productData.productStock += oldInventory.change;
        } else{
            productData.productStock -= oldInventory.change;
        }

        if(reason == "Purchase"){
            productData.productStock -= change
        } else {
            productData.productStock += change
        }

        if(productData.productStock < 0){
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Product stock cannot be negative!"
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