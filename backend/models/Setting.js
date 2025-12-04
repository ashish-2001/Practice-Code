import mongoose from "mongoose";


const SettingSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },

    value: mongoose.Schema.Types.Mixed,

    description: String
}, { timestamps: true });

SettingSchema.index({ key: 1 }, { unique: true });

const Setting = mongoose.model('Setting', SettingSchema);

export {
    Setting
}