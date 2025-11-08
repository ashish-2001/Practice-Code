import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({

    firstName: {
        type: String,
        required: true
    },

    lastName: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    contactNumber: {
        type: String,
        required: true
    },

    customerImage: {
        type: String
    },

    address: {
        type: String
    },

    role: {
        type: String,
        enum: ["Customer"],
        default: "Customer"
    }
}, { timestamps: true });

const Customer = mongoose.model("Customer", customerSchema) ;

export {
    Customer
}