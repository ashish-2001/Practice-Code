import mongoose from "mongoose";
import { Address } from "./Address";
import { OrderItemSchema } from "./OrderItem";

const OrderSchema = new mongoose.Schema({

    orderNumber: {
        type: String,
        required: true,
        unique: true,
        index: true
    }, 

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    items: [OrderItemSchema],

    shippingAddress: Address,

    billingAddress: Address,

    subTotal: {
        type: Number,
        required: true
    },

    shippingPrice: {
        type: Number,
        default: 0
    },

    discount: {
        type: Number,
        default: 0
    },

    totalAmount: {
        type: Number,
        required: true
    },

    paymentMethod: {
        type: String,
        enum: ['Online', 'COD', 'Wallet', 'UPI', 'NetBanking'],
        default: 'Online'
    },

    paymentStatus: {
        type: String,
        enum: ['Paid', 'Pending', 'Failed', 'Refunded'],
        default: 'Pending'
    },

    orderStatus: {
        type: String,
        enum: ['Created', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Returned', 'Refunded'],
        default: 'Created'
    },

    trackingNumber: {
        type: String
    },

    courier: {
        type: String
    },

    notes: {
        type: String
    },

    coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon',
        default: null
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    shippedAt: {
        type: Date
    },

    deliveredAt: {
        type: Date
    },

    cancelledAt: {
        type: Date
    },

    refundedAt: {
        type: Date
    }
}, { timestamps: true });

OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ user: 1, orderStatus: 1 });

const Order = mongoose.model("Order", OrderSchema);

export {
    Order
}