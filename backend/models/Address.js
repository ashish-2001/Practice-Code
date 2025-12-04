import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({

    fullName: {
        String
    },

    phone: {
        String
    },

    addressLine1: {
        String
    },

    addressLine2: {
        String
    },

    city: {
        String
    },

    state: {
        String
    }, 

    postalCode: {
        String
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