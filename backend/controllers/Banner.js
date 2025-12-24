import z from "zod";
import { Banner } from "../models/Banner";

const bannerValidator = z.object({
    title: z.string().min(3, "Title is too small"),
    image: z.string().min(1, "Image is required!"),
    link: z.string().url("Invalid Url"),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    priority: z.number().int().min(1),
    active: z.boolean().optional()
});

async function createBanner(req, res){

    try{
        const parsedResult = bannerValidator.safeParse(req.body);

        if(!parsedResult.success){
            return res.status(400).json({
                success: false,
                message: parsedResult.error.errors[0].message
            });
        };

        const { title, image, link, startDate, endDate, priority, active } = parsedResult.data;

        if(req.user.role !== "Admin"){
            return res.status(403).json({
                success: false,
                message: "Only admin can create banner!"
            });
        };

        const userId = req.user._id;

        const banner = await Banner.create({
            title: title,
            image: image,
            link: link,
            startDate: startDate,
            endDate: endDate,
            priority: priority,
            active: active,
            createdBy: userId
        });

        if(!banner){
            return res.status(302).json({
                success: false,
                message: "Banner could not be created!"
            });
        };

        return res.status(201).json({
            success: true,
            message: "Banner created successfully!",
            data: banner
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

        const userId = req.user._id;

        const banners = await Banner.find(userId, { isDeleted: false })
        .populate("createdBy", "name email")
        .populate("updatedBy", "name email")
        .populate("deletedBy", "name email")
        .sort({ priority: 1, createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "All banner fetched successfully!",
            data: banners
        })
    } catch(e){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error: e.message
        });
    };
};

const bannerUpdatedValidator = bannerValidator.partial();

async function updateBanner(req, res){

    try{

        const { bannerId } = req.params;
        const userId = req.user._id;

        const parsedResult = bannerUpdatedValidator.safeParse();

        if(!parsedResult.success){
            return res.status(400).json({
                success: false,
                message: parsedResult.error.errors[0].message
            })
        };

        const updatedBanner = await Banner.findOneAndUpdate(
            {
                _id: bannerId,
                isDeleted: false
            },
            {
                ...parsedResult.data,
                updatedBy: userId
            },
            {
                new: true
            }
        );

        if(!updatedBanner){
            return res.status(400).json({
                success: false,
                message: "Banner not updated!"
            })
        }

        return res.status(200).json({
            success: false,
            message: "Banner updated successfully!",
            data: updatedBanner
        })
    } catch(e){
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: e.message
        })
    }
};

async function getSingleBanner(req, res){

    try{
        const now = new Date();
        const { bannerId } = req.params;

        const banner = await Banner.findOne({
            _id: bannerId,
            active: true,
            isDeleted: false,
            startDate: {
                $lte: now
            },
            endDate: {
                $gte: now
            }
        })
        .toConstructor({ priority: 1, createdAt: -1 })
        .select("title image link startDate endDate");

        if(!banner){
            return res.status(200).json({
                success: true,
                data: null
            })
        };

        return res.status(200).json({
            success: true,
            data: banner
        })
    } catch(e){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error: e.message
        })
    }
}

async function deleteBanner(req, res){

    try{

        const { bannerId } = req.params;
        const userId = req.user._id;

        const deletedBanner = await Banner.findOneAndDelete(
            {
                _id: bannerId,
                isDeleted: false
            },
            {
                isDeleted: true,
                deletedBy: userId
            },
            {
                new: true
            }
        );

        if(!deletedBanner){
            return res.status(404).json({
                success: false,
                message: "Banner not found!"
            });
        };

        return res.status(200).json({
            success: false,
            message: "Banner deleted successfully!"
        })

    } catch(e){
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: e.message
        })
    }
}

export {
    createBanner,
    getAllBanner,
    getSingleBanner,
    updateBanner,
    deleteBanner
}