import z, { success } from "zod";
import { User } from "../models/User";
import { Coupon } from "../models/Coupon";

const couponValidator = z.object({
    code: z.string().min(5).max(10).transform(val => val.toUpperCase()).refine(val => /^[A-Z0-9]+$/.text(val), {
        message: "Coupon can contain only A-Z and 0-9"
    }),
    product: z.string().min(1, "Product is required!"),
    category: z.string().min(1, "Category is required!"),
    discountType: z.string().enum(["Flat", "Percentage"]),
    discountValue: z.number().min(1),
    minOrderAmount: z.number().min(0).optional(),
    maxDiscount: z.number().optional(),
    expiry: z.string(),
    active: z.boolean()
});

async function coupon(req, res){

    try{

        const parsedResult = couponValidator.safeParse(req.body);

        if(!parsedResult.success){
            return res.status(403).json({
                success: false,
                message: "All fields are required!"
            });
        };

        const data = parsedResult.data;

        const user = await User.findById(req.user._id);

        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found!"
            });
        };

        if(!["Admin", "Seller"].includes(user.role)){
            return res.status(403).json({
                success: false,
                message: "Admin and seller can only create coupon!"
            });
        };

        const coupon = await Coupon.create({
            ...data,
            createdBy: user._id
        });

        return req.status(200).json({
            success: true,
            message: "Coupon created successfully!",
            coupon
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error: error.message
        });
    }
}

export {
    coupon
}