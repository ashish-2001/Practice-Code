import mongoose from "mongoose";

const festivalSchema = new mongoose.Schema({
    
    name: {
        type: String,
        required: true
    },

    description: {
        type: String
    },

    productIds: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },

    startDate: {
        type: Date,
        required: true
    },

    endDate: {
        type: Date,
        required: true
    },

    autoHideAfterEnd: {
        type: Boolean,
        default: true
    },

    active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

festivalSchema.index({ startDate: 1, endDate: 1, active: 1 });

const Festival = mongoose.model("Festival", festivalSchema);

export {
    Festival
}