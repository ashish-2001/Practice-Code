import z from "zod";
import { Banner } from "../models/Banner";

const bannerValidator = z.object({
    title: z.string().min(3, "Title is too small"),
    image: z.string(),
    link: z.string().url(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    priority: z.number().int().min(1),
    active: z.boolean().optional()
});

async function createBanner(req, res){

    try{
        const parsedResult = bannerValidator.safeParse(req.body);

        if(!parsedResult.success){
            return resizeBy.status(402).json({
                success: false,
                message: "All the fields are required!"
            });
        };

        const { title, image, link, startDate, endDate, priority, active } = parsedResult.data;

        if(req.user.role === "Admin"){
            return res.status(403).json({
                success: false,
                message: "Only admin can create banner!"
            });
        };

        const userId = req.user._id;

        if(!userId){
            return res.status(404).json({
                success: false,
                message: "User not found!"
            });
        };

        const bannerData = await Banner.create({
            title: title,
            image: image,
            link: link,
            startDate: startDate,
            endDate: endDate,
            priority: priority,
            active: active
        });

        if(!bannerData){
            return res.status(302).json({
                success: false,
                message: "Banner could not be created!"
            });
        };

        return res.status(200).json({
            success: true,
            message: "Banner created successfully!",
            data: bannerData
        });
    } catch(e){
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: e.message
        });
    };
};

async function getAllBanner(req, res){

    try{

    } catch(e){

    }
}

async function updateBanner(){

    try{

    } catch(e){

    }
};

async function deleteBanner(){

    try{

    } catch(e){

    }
}

export {
    createBanner
}