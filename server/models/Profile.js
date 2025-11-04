import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({

    contactNumber: {
        type: String,
        required: true
    },

    gender: {
        type: String,
        required: true
    },

    about: {
        type: String,
        required: true
    },

    dateOfBirth: {
        type: String,
        required: true
    }

});

const Profile = mongoose.model("Profile", profileSchema);

export {
    Profile
}