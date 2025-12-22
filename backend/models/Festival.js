import mongoose from "mongoose";

const FestivalSchema = new mongoose.Schema({
    
    name: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        trim: true
    },

    productIds: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }
    ],

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
        ref: 'User',
        required: true
    },

    creatorRole: {
        type: String,
        enum: ['Admin'],
        default: 'Admin'
    },

    active: {
        type: Boolean,
        default: true
    }

}, { timestamps: true });

FestivalSchema.index({ startDate: 1, endDate: 1, active: 1 });

FestivalSchema.pre("save", function(next){
    if(this.endDate < this.startDate){
        return next(new Error("End date must be greater than start date"));
    }
    next();
})

const Festival = mongoose.model("Festival", FestivalSchema);

export {
    Festival
}