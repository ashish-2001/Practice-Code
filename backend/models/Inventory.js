import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({

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