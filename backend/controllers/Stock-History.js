import { StockHistory } from "../models/StockHistory";
import mongoose from "mongoose";
import { Product } from "../models/Product";

const getUserId = (req) => req.user?.userId || req.user._id;

async function logStockHistory({ productId, quantityChange, reason, changedBy, orderId = null, note = "", session = null }){
    
    if(!productId || !quantityChange || !changedBy){
        throw new Error("Missing stock history required fields!")
        
    }

    const historyData = {
        product: productId,
        change: quantityChange,
        reason,
        changedBy,
        note
    };

    if(orderId){
        historyData.order = orderId;
    }

    const options = session ? { session } : {};

    await StockHistory.create([historyData], options);
}

async function getAllStockHistory(req, res){

    try{
        if(!req.user || req.user.role !== "Admin"){
            return res.status(403).jso({
                success: false,
                message: "Only admin can get all the history of the stocks of all the products"
            })
        }

        const history = await StockHistory.find()
        .populate("product", "productName productStock")
        .populate("order", "orderNumber")
        .populate("changedBy", "name email")
        .sort({ createAt: -1 });

        return res.status(200).json({
            success: false,
            message: "All the history of the stock of the product is fetched successfully",
            count: history.length,
            history
        })
    } catch(e){
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: e.message
        })
    }
}

async function getStockHistoryByProduct(req, res){

    try{
        if(!req.user || req.user.role !== "Admin"){
            return res.status(403).json({
                success: false,
                message: "Only admin can view product history stock"
            })
        }

        const { productId } = req.params;

        const history = await StockHistory.findById({ product: productId })
        .populate("order", "orderNumber")
        .populate("changedBy", "name email")
        .sort({ createdAt: -1 });

        return res.status(200).json({
            success: false,
            message: "All product stock history is fetched",
            count: history.length,
            history
        })
    } catch(e){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error: e.message
        });
    };
}

async function manualStockAdjustment(req, res){

    const session = await mongoose.startSession();
    session.startTransaction();
    try{

        if(!req.user || req.user.role !== "Admin"){
            return res.status(403).json({
                success: false,
                message: "Only admin can adjust the stock of the product"
            })
        }

        const { productId, quantityChange, note } = req.body;

        if(!productId || !quantityChange){
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Product id and quantity change are required!"
            });
        };

        const product = await Product.findById(productId).session(session);
        if(!product){
            return res.status(404).json({
                success: false,
                message: "Product not found!"
            })
        };

        product.productStock += quantityChange;

        if(product.productStock < 0){
            return res.status(400).json({
                success: false,
                message: "Stock cannot be negative"
            })
        }

        await product.save();

        await logStockHistory({
            productId,
            changedBy: getUserId(req),
            quantityChange,
            reason: "Manual Adjustment",
            note,
            session
        });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: false,
            message: "Stock of the is adjusted successfully",
            product
        })
    } catch(e){
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: e.message
        });
    };
};

async function getStockHistoryByOrder(req, res){
    try{
        if(!req.user || req.user.role !== "Admin"){
            return res.status(403).json({
                success: false,
                message: "Only admin can get the history of stock"
            });
        };

        const { orderId } = req.params;

        const history = await StockHistory.find({ order: orderId })
        .populate("product", "productName")
        .populate("changedBy", "firstName lastName")
        .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Stock of the product is fetched successfully",
            count: history.length,
            history
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
    getAllStockHistory,
    getStockHistoryByProduct,
    manualStockAdjustment,
    getStockHistoryByOrder
}