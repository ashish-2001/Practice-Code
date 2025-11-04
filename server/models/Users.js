import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

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
        required: true
    },

    password: {
        type: String,
        required: true
    },

    confirmPassword: {
        type: String,
        required: true
    },

    image: {
        type: String
    },

    token: {
        type: String
    },

    additionalProfileDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile"
    }
    
});

const User = mongoose.model("User", userSchema);

export {
    User
}