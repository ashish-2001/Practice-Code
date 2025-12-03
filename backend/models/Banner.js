import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
    
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
    }
}, { timestamps: true });

bannerSchema.index({ active: 1, startDate: 1, endDate: 1 });

const Banner = mongoose.model("Banner", bannerSchema);

export {
    Banner
}