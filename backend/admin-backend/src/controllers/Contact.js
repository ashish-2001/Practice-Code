import z, { success } from "zod";
import { Seller } from "../models/Seller.js";

const contactValidator = z.object({
    firstName: z.string().min(1, "First name is required!"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Email format is not correct!"),
    message: z.string().min(1, "Message is required!")
});

async function contact(req, res){

    try{
        const parsedResult = contactValidator.safeParse(req.body);

        if(!parsedResult.success){
            return res.status(402).json({
                success: false,
                message: "All fields are required!"
            });
        };

        const {
            firstName,
            lastName,
            email,
            message
        } = parsedResult.data;

        const sellerId = req.seller?.sellerId;

        const seller = await Seller.findById(sellerId);

        if(!seller){
            return res.status(402).json({
                success: false,
                message: "Seller not found!"
            });
        };

        const contactMessage = await Seller.create({
            firstName,
            lastName,
            email,
            message
        });

        return res.status(200).json({
            success: true,
            message: "Message has been sent successfully!",
            contactMessage
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error
        });
    };
};

export {
    contact
}