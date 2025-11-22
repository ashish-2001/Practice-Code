import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({

    orderId: {
        type: String,
        required: true
    },

    paymentId: {
        type: String
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: ["Created", "Success", "Fail"],
        default: "Created"
    }
}, { timestamps: true });

const Payment = mongoose.model("Payment", paymentSchema);

export {
    Payment
}

