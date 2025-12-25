import mongoose from "mongoose";
import { instance } from "../config/razorpay";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { Transaction } from "../models/Transaction";
import { mailSender } from "../utils/mailSender";
import { refundSuccessfulEmail } from "../mail/templates/refundSuccessfulEmail";
import { success } from "zod";

async function requestRefund(req, res){

    const session = await mongoose.startSession();
    session.startTransaction();
    
    try{
        const { orderId, reason } = req.body;

        const userId = req.user._id;

        if(!orderId){
            return res.status(400).json({
                success: false,
                message: "Order id is required"
            });
        };

        const order = await Order.findOne({
            _id: orderId,
            user: userId,
        }).session(session);

        if(!order){
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        };

        if(order.paymentStatus !== "Paid"){
            return res.status(400).json({
                success: false,
                message: "Only paid orders can be refunded"
            });
        };

        if(order.paymentStatus === "Refunded"){
            return res.status(400).json({
                success: false,
                message: "Order already refunded"
            })
        };

        const transaction = await Transaction.findOne({
            order: order._id,
            status: "Success"
        }).session(session);

        if(!transaction || !transaction.txnId){
            return res.status(400).json({
                success: false,
                message: "Valid payment not found"
            });
        };

        const refund = await instance.payments.refund(transaction.txnId, {
            amount: order.totalAmount * 100,
            notes: { reason: reason || "User requested refund"}
        });

        transaction.status = "Refunded";
        transaction.providerResponse = refund;

        order.paymentStatus = "Refunded";
        order.orderStatus = "Refunded";
        order.refundedAt = new Date();

        await transaction.save({ session });
        await order.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: "Refund initiated successfully"
        })
    } catch(e){
        await session.abortTransaction();
        session.endSession();

        return res.status(500).json({
            success: false,
            message: "Refund failed",
            error: e.message
        })
    }
};



async function refundPayment(req, res){

    const session = await mongoose.startSession();
    session.startTransaction();

    try{
        const { orderId, paymentId, reason } = req.body;
        const userId = req.user._id;
        
        if(!orderId || !paymentId){
            return res.status(400).json({
                success: false,
                message: "Order id and payment id is required!"
            });
        };

        const order = await Order.findOne({
            _id: orderId,
            user: userId,
        }).session(session);

        if(!order){
            return res.status(400).json({
                success: false,
                message: "Order not found"
            });
        }

        if(order.paymentStatus !== "Paid"){
            return res.status(400).json({
                success: false,
                message: "Only paid orders can be refunded"
            });
        };

        if(order.orderStatus === "Refunded"){
            return res.status(400).json({
                success: false,
                message: "Order already refunded!"
            });
        };

        const refund = await instance.payments.refund(paymentId, {
            amount: order.totalAmount * 100,
            notes: { reason: reason || "Customer requested refund" }
        });

        for(const item of order.items){
            await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: item.quantity }},
                { session }
            );
        };

        order.paymentStatus = "Refunded";
        order.orderStatus = "Refunded";
        order.refundedAt = new Date();

        await order.save({ session });

        await Transaction.findOneAndUpdate(
            { order: order._id },
            {
                status: "Refunded",
                providerResponse: refund
            },
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        await mailSender(
            req.user.email,
            "Refund Successful",
            refundSuccessfulEmail(
                req.user.name,
                order.orderNumber,
                order.totalAmount
            )
        );

        return res.status(200).json({
            success: true,
            message: "Refund processed successfully"
        });
    } catch(e){
        await session.abortTransaction();
        session.endSession();

        return res.status(500).json({
            success: false,
            message: "Refund failed",
            error: e.message
        })
    }
}

export {
    refundPayment
};