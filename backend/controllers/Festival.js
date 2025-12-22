import mongoose from "mongoose";
import z, { success } from "zod";
import { Festival } from "../models/Festival";

const createFestivalValidator = z.object({
    name: z.string().min(1, "Festival name is required"),
    description: z.string().optional(),
    productIds: z.array(z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
        message: "Invalid product id"
    })).optional(),
    startDate: z.string().datetime({ message: "Invalid start date" }),
    endDate: z.string().datetime({ message: "Invalid end date" }),
    autoHideAfterEnd: z.boolean().optional(),
    active: z.boolean().optional()
});


async function createFestival(req, res){

    try{

        const parsedResult = createFestivalValidator.safeParse(req.body);

        if(!parsedResult.success){
            return res.status(400).json({
                success: false,
                message: parsedResult.error.errors[0].message
            })
        };

        if(!req.user || req.user.role !== "Admin"){
            return res.status(403).json({
                success: false,
                message: "Only admin can create festival"
            });
        };

        const { name, description, productIds, startDate, endDate, autoHideAfterEnd, active } = parsedResult.data;

        const festival = await Festival.create({
            name,
            description,
            productIds,
            startDate,
            endDate,
            autoHideAfterEnd,
            active,
            createdBy: req.user._id,
            creatorRole: "Admin"
        });

        if(!festival){
            return res.status(404).json({
                success: false,
                message: "Festival could not be created!"
            });
        };

        return res.status(201).json({
            success: true,
            message: "Festival created successfully!",
            data: festival
        })

    } catch(e){
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: e.message
        });
    };
};

async function updateFestival(req, res){

    try{

        const parsedResult = createFestivalValidator.safeParse(req.body);

        if(!parsedResult.success){
            return res.status(403).json({
                success: false,
                message: "All fields are required!"
            });
        };

        if(!req.user || req.user.role !== "Admin"){
            return res.status(402).json({
                success: false,
                message: "Only admin can update festival"
            });
        };

        const { festivalId } = req.params;

        if(!mongoose.Types.ObjectId.isValid(festivalId)){
            return res.status(400).json({
                success: false,
                message: "Invalid festival id"
            });
        };

        const festival = await Festival.findById(festivalId)

        if(!festival){
            return res.status(404).json({
                success: false,
                message: "Festival not found"
            });
        };

        if(festival.createdBy.toString() !== req.user._id.toString()){
            return res.status(403).json({
                success: false,
                message: "You are not allowed to update the festival"
            });
        };

        if(Object.keys(parsedResult.data).length === 0){
            return res.status(400).json({
                success: false,
                message: "No fields provided to update"
            })
        }

        Object.assign(festival, parsedResult.data);

        if(festival.endDate < festival.startDate){
            return res.status(400).json({
                success: false,
                message: "End date must be greater than start date"
            })
        };

        await festival.save();

        return res.status(200).json({
            success: false,
            message: "Festival updated successfully",
            data: festival
        })
    } catch(e){
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: e.message
        })
    };
};

async function getAllFestival(req, res){

    try{

    } catch(e){
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: e.message
        })
    };
};

async function getSingleFestival(req, res){

    try{

    } catch(e){
        return  res.status(500).json({
            success: false,
            message: "Internal server error",
            error: e.message
        })
    };
};

async function deleteFestival(req, res){
    try{

    } catch(e){
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: e.message
        })
    };
};

export {
    createFestival,
    updateFestival,
    getAllFestival,
    getSingleFestival,
    deleteFestival
}