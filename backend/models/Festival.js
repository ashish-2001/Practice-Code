import mongoose from "mongoose";

const FestivalSchema = new mongoose.Schema({
    
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

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    creatorRole: {
        type: String,
        enum: ['Admin', 'Customer'],
        default: 'Admin'
    },

    active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

FestivalSchema.index({ startDate: 1, endDate: 1, active: 1 });

const Festival = mongoose.model("Festival", FestivalSchema);

export {
    Festival
}