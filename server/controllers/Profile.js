import z, { success } from "zod";
import { User } from "../models/Users.js";
import { Profile } from "../models/Profile.js";

const updateProfileValidator = z.object({
    firstName: z.string().min(1, "First name is required!").optional(),
    lastName: z.string().min(1, "Last name is required!").optional(),
    gender: z.enum(["Male", "Female"]).optional(),
    dateOfBirth: z.string().optional(),
    bio: z.string().min(1, "bio is required!").optional(),
    contactNumber: z.string().regex(/^[0-9]{10}$/, "Contact number is required!").optional()
});


async function updateProfile(req, res){

    try{

        const parsedResult = updateProfileValidator.safeParse(req.body);

        if(!parsedResult.success){
            return res.status(404).json({
                success: false,
                message: true
            });
        };

        const {
            firstName,
            lastName,
            gender,
            bio,
            contactNumber,
            dateOfBirth
        } = parsedResult.data;

        const userId = req.user.userId;

        const userDetails = await User.findById(userId);

        if(!userDetails){
            return res.status(404).json({
                success: false,
                message: "User could not be found!"
            });
        };

        const profile = await Profile.findById(userDetails.additionalProfileDetails);

        if(!profile){
            return res.status(404).json({
                success: true,
                message: "Profile could not be found!"
            });
        };

        const user = await User.findByIdAndUpdate(userId, {
            firstName,
            lastName
        });

        await user.save();

        profile.dateOfBirth = dateOfBirth,
        profile.gender = gender;
        profile.contactNumber = contactNumber,
        profile.bio = bio;

        await profile.save();

        const updatedUserDetails = await User.findById(userId).populate("additionalProfileDetails").exec() ;

        return res.status(200).json({
            success: false,
            message: "Profile updated successfully!",
            updatedUserDetails
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error
        });
    };
};

async function updateDisplayPicture(req, res){

    try{
        const displayPicture = req.files.displayPicture;

        if(!displayPicture){
            return res.status(404).json({
                success: false,
                message: "Image not found!"
            });
        };

        const userId = req.user.userId;

        const image = await uploadImageToCloudinary(
            displayPicture,
            process.env.FOLDER_NAME,
            1000,
            1000
        );

        const updatedUserDetails = await User.findByIdAndUpdate(
            userId,
            {
                image: image.secure_url
            },
            {
                new: true
            }
        );

        if(!updatedUserDetails){
            return res.status(404).json({
                success: false,
                message: "User not found!"
            });
        };

        return res.status(200).json({
            success: true,
            message: "Image uploaded successfully!"
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error
        });
    };
}

export {
    updateProfile,
    updateDisplayPicture
}