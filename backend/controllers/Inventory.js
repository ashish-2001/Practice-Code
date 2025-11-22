import mongoose from "mongoose";
import z, { success } from "zod";
import { Product } from "../models/Product";
import { Inventory } from "../models/Inventory";
import { User } from "../models/User";

const inventoryValidator = new mongoose.Schema({
    change: z.number().min(1, "Inventory is required!"),
    reason: z.enum(["Purchase", "Order Cancelled", "Stock update"]),
})

async function inventory(req, res){

    const parsedResult = inventoryValidator.safeParse(requestAnimationFrame.body);

    if(!parsedResult.success){
        return res.status(403).json({
            success: false,
            message: "All the fields are required!"
        });
    };

    const {
        change,
        reason
    }  = parsedResult.data;

    const userId = req.user._id;
    
    const user = await User.findById(userId);

    if(!user){
        return res.status(404).json({
            success: false,
            message: "User not found!"
        });
    };

    const productId = req.product?._id;

    const productData = await Product.findById(productId).populate("category");

    if(!productData){
        return res.status(404).json({
            success: false,
            message: "Product not found!"
        });
    };
    
    if(req.user?.role === "Seller"){
        if(String(productData.createdBy) !== String(req.user._id)){
            return res.status(403).json({
                success: false,
                message: "You cannot updated another's product data!"
            });
        };
    };

    if(reason === "Purchase"){
        productData.productStock -= change
    }

    if(reason === "Order Cancelled"){
        productData.productStock += change
    };

    if(reason === "Stock update"){
        productData.productStock += change
    }

    if(productData.productStock > 0){
        return res.status(400).json({
            success: false,
            message: "Stock cannot be negative!"
        });
    };

    await productData.save();

    const inventoryLog = await Inventory.create({
        product,
        change,
        reason
    });

    return res.status(200).json({
        success: true,
        message: "Inventory created successfully!",
        productStock: productData.productStock,
        inventory: inventoryLog
    });

};


export {
    inventory
}