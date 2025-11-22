import z from "zod";
import { User } from "../models/User.js";
import { Contact } from "../models/Contact.js";

const contactValidator = z.object({
    firstName: z.string().min(1, "First name is required!"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Email format is not correct!"),
    contactNumber: z.number().min(10, "Contact number is not correct!"),
    message: z.string().min(1, "Message is required!")
});

async function createMessage(req, res){

    try{
        const parsedResult = contactValidator.safeParse(req.body);

        if(!parsedResult.success){
            return res.status(400).json({
                success: false,
                message: "All fields are required!"
            });
        };

        const {
            firstName,
            lastName,
            email,
            message,
            contactNumber
        } = parsedResult.data;

        if(contactNumber !== 10 ){
            return res.status(403).json({
                success: false,
                message: "Contact number is invalid!"
            })
        }

        const userId = req.user?.userId;

        const user = await User.findById(userId);

        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found!"
            });
        };
        const contactMessage = await Contact.create({
            firstName,
            lastName,
            email,
            message,
            user: userId
        });

        return res.status(200).json({
            success: true,
            message: "Message has been sent successfully!",
            data: contactMessage
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error
        });
    };
};

async function getAllMessages(req, res){

    try{

        const messages = await Contact.find({}).populate("user", "firstName lastName email message").sort({
            createdAt: -1
        });

        return res.status(200).json({
            success: true,
            message: "ALl messages fetched successfully!",
            messages
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error
        });
    };
};

async function updateMessages(req, res){

    try{
        const { messageId } = req.params;
        const { status } = req.body;

        if(!status){
            return res.status(400).json({
                success: false,
                message: "Status is required!"
            });
        };

        const updatedMessages = await Contact.findByIdAndUpdate(
            messageId,
            {
                status
            },
            {
                new: true
            }
        );

        if(!updatedMessages){
            return res.status(402).json({
                success: false,
                message: "Message could not be updated!"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Message updated successfully!",
            data: updatedMessages
        })
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error
        });
    };

}

export {
    createMessage,
    getAllMessages,
    updateMessages
}