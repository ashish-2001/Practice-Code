import mongoose from "mongoose";
import { instance } from "../config/razorpay";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { Transaction } from "../models/Transaction";
import { verifyRazorpayWebhook } from "../utils/verifyRazorpayWebhook";

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

async function razorpayWebhook(req, res){
    const session = session.startSession();
    session.startTransaction()

    try{
        const isValid = verifyRazorpayWebhook(req);

        if(!isValid){
            return res.status(401).json({
                success: false,
                message: "Field is required"
            })
        }

        const event = req.body.event;
        const payload = req.body.payload;

        if(event === "refund.processed"){
            const refund = payload.refund.entry;
            const paymentId = refund.payment_id;

            const session = await session.startSession();
            session.startTransaction();

            const transaction = await Transaction.findOne({
                txnId: paymentId
            }).session({ session });

            if(!transaction){
                await session.abortTransaction();
                session.endSession();
                return res.status(200).json({
                    success: true
                })
            }

            const order = await Order.findById(transaction.order).session(session);

            if(!order || order.paymentStatus === "Refunded"){
                await session.commitTransaction()
                session.endSession();
                return res.status(200).json({
                    success: true
                });
            }

            for(const item of order.items){
                await Product.findByIdAndUpdate(
                    item.product,
                    { $inc: { stock: item.quantity }},
                    { session }
                )
            };

            transaction.status = "Refunded";
            transaction.providerResponse = refund;

            order.paymentStatus = "Refunded";
            order.orderStatus = "Refunded";
            order.refundedAt = new Date();

            await transaction.save({ session });
            await order.save({ session });

            await session.commitTransaction();
            session.endSession();
        }

        return res.status(200).json({
            success: true
        })
    } catch(e){
        await session.abortTransaction();
        session.endSession()

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: e.message
        })
    }
};

export {
    requestRefund,
    razorpayWebhook
}
