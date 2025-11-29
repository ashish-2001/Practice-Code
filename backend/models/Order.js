import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({

    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
        required: true
    },

    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            }, 

            quantity: {
                type: Number,
                required: true,
                min: 1,
                default: 1
            },

            price: {
                type: Number,
                required: true
            }
        }
    ],

    totalAmount: {
        type: Number,
        required: true
    },

    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid", "Failed"],
        default: "Pending"
    },

    orderStatus: {
        type: String,
        enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
        default: "Processing"
    },

    address: {
        type: String,
        required: true
    },

    paymentMethod: {
        type: String,
        enum: ["Cash on Delivery", "Online"],
        default: "Cash on Delivery"
    }
    
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

export {
    Order
}