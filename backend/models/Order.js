import mongoose from "mongoose";
import { Address } from "./Address.js";
import { OrderItemSchema } from "./OrderItem.js";

const OrderSchema = new mongoose.Schema({

    orderNumber: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true
    }, 

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    items:{ 
        type: [OrderItemSchema],
        required: true,
        validate: [v => v.length > 0, "Order must have at least one item"]
    },

    shippingAddress: {
        type: Address,
        required: true
    },

    billingAddress: {
        type: Address,
        required: true
    },

    subTotal: {
        type: Number,
        required: true,
        min: 0
    },

    shippingPrice: {
        type: Number,
        default: 0,
        min: 0
    },

    discount: {
        type: Number,
        default: 0,
        discount: 0
    },

    totalAmount: {
        type: Number,
        required: true,
        min: 0
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

OrderSchema.pre("save", function(next){
    
        const itemsTotal = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        this.subTotal = itemsTotal;
        this.totalAmount = itemsTotal + (this.shippingPrice || 0) ( this.discount || 0);
    next()
})

const Order = mongoose.model("Order", OrderSchema);

export {
    Order
}