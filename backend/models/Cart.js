import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        unique: true,
        required: true
    },

    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: "Product"
            },
            quantity: {
                type: Number,
                min: 1
            }
        }
    ]
}, { timestamps: true });

const Cart = mongoose.model("Cart", cartSchema);

export {
    Cart
}