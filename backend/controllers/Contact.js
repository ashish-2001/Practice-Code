import z from "zod";
import { User } from "../models/User.js";
import { Contact } from "../models/Contact.js";

const contactValidator = z.object({
    firstName: z.string().min(1, "First name is required!"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Email format is not correct!"),
    contactNumber: z.string().regex(/^\d+$/, "Contact number must contain only digits").length(10, "Contact number must be exactly 10 digits!"),
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
            contactNumber,
            message
        } = parsedResult.data;

        if(contactNumber !== 10 ){
            return res.status(403).json({
                success: false,
                message: "Contact number is invalid!"
            })
        }

        const userId = req.user?._id;

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
            contactNumber,
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

        if(req.user.role !== "Admin"){
            return res.status(403).json({
                success: false,
                message: "Only admin can view all the messages!"
            });
        }

        const messages = await Contact.find({})
        .populate("user", "firstName lastName email contactNumber message").sort({
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

async function updateMessageStatus(req, res){

    try{

        if(req.user.role !== "Admin"){
            return res.status(403).json({
                success: false,
                message: "Only admins can update message status!"
            })
        }
        const { messageId } = req.params;
        const { status } = req.body;

        if(!status){
            return res.status(400).json({
                success: false,
                message: "Status is required!"
            });
        };

        const allowedStatus = ["Pending", "Resolved"];

        if(!allowedStatus.includes(status)){
            return res.status(403).json({
                success: false,
                message: "Invalid status!"
            })
        }

        const updatedMessageStatus = await Contact.findByIdAndUpdate(
            messageId,
            {
                status
            },
            {
                new: true
            }
        );

        if(!updatedMessageStatus){
            return res.status(402).json({
                success: false,
                message: "Message status could not be updated!"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Message status updated successfully!",
            data: updatedMessageStatus
        })
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error: error.message
        });
    };

}

export {
    createMessage,
    getAllMessages,
    updateMessageStatus
}