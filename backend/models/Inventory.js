import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },

    change: {
        type: Number,
        required: true
    },

    reason: {
        type: String,
        enum: ["Purchase", "Order Cancelled", "Stock update"],
        required: true
    }
});

const Inventory = mongoose.model("Inventory", inventorySchema);

export {
    Inventory
}