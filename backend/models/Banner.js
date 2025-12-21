import mongoose from "mongoose";

const BannerSchema = new mongoose.Schema({
    
    title: {
        type: String
    },

    image: {
        type: String,
        required: true
    },

    link: {
        type: String
    },

    startDate: {
        type: Date,
        default: null
    },

    endDate: {
        type: Date,
        default: null
    },

    priority: {
        type: Number,
        default: 10
    },

    active: {
        type: Boolean,
        default: true
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    isDeleted: {
        type: Boolean,
        default: false
    }
    
}, { timestamps: true });

BannerSchema.index({ active: 1, startDate: 1, endDate: 1 });

const Banner = mongoose.model("Banner", BannerSchema);

export {
    Banner
}