import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({

    name: {
        type: String
    },

    phone: {
        type: String
    },

    addressLine1: {
        type: String
    },

    addressLine2: {
        type: String
    },

    city: {
        type: String
    },

    state: {
        type: String
    }, 

    postalCode: {
        type: String
    },

    country: {
        type: String,
        default: 'Bharat'
    }

}, { _id: false });

const Address = mongoose.model('Address', AddressSchema);

export {
    Address
}