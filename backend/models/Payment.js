import mongoose from "mongoose";
import z from "zod";

const paymentSchema = z.object({

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

