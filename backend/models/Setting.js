import mongoose from "mongoose";
import { Schema } from "zod/v3";

const settingSchema = new mongoose.model({
    key: {
        type: String,
        required: true,
        unique: true
    },

    value: Schema.Types.Mixed,

    description: String
}, { timestamps: true });

settingSchema.index({ key: 1 }, { unique: true });

const Setting = mongoose.model('Setting', settingSchema);

export {
    Setting
}