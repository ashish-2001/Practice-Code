import z, { success } from "zod";
import { User } from "../models/User";
import { Coupon } from "../models/Coupon";
import { Product } from "../models/Product";
import { Category } from "../models/Category";

const couponValidator = z.object({
    code: z
            .string()
            .min(5)
            .max(10)
            .transform(val => val.toUpperCase())
            .regex(/^[A-Z0-9]+$/, "Coupon can contain only A-Z and 0-9"),
    description: z.string().optional(),
    discountType: z.enum(["Fixed", "Percentage"]),
    discountValue: z.number().positive(),
    minPurchase: z.number().min(0).optional(),
    usageLimit: z.number().nullable().optional(),
    perUserLimit: z.number().optional(),
    validFrom: z.coerce.date().optional(),
    validUntil: z.coerce.date().nullable().optional(),
    active: z.boolean(),
    appliesTo: z.enum(["all", "products", "categories"]),
    appliesIds: z.array(z.string()).optional()
});

async function createCoupon(req, res){

    try{

        if(req.user.role !== "Admin"){
            return res.status(400).json({
                success: false,
                message: "Only admin can create coupon!"
            });
        };

        const parsedResult = couponValidator.safeParse(req.body);

        if(!parsedResult.success){
            return res.status(400).json({
                success: false,
                message: parsedResult.error.errors[0].message
            });
        };

        const { data } = parsedResult.data;

        const existing = await Product.findOne({
            code: data.code
        });

        if(existing){
            return res.status(409).json({
                success: false,
                message: "Coupon code already exist!"
            });
        }

        let appliesToModel = null;

        if(data.appliesTo === "products"){
            appliesToModel = "Product"

            const count = await Product.countDocuments({ _id: { $in: data.appliesIds }})

            if(count !== data.appliesIds.length){
                return res.status(400).json({
                    success: false,
                    message: "Invalid product id"
                })
            }
        }

        if(data.appliesTo === "categories"){
            appliesToModel = "Category";
            const count = await Category.countDocuments({ _id: {
                $in: data.appliesIds
            }})

            if(count !== data.appliesTo.length){
                return res.status(400).json({
                    success: false,
                    message: "Invalid category Id"
                })
            }
        }

        const coupon = await Coupon.create({
            ...data,
            appliesToModel,
            createdBy: req.user._id
        })

        return res.status(201).json({
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

async function updateCoupon(req, res){

    try{
        const couponId = req.params.id;

        if(req.user.role !== "Admin"){
            return res.status(400).json({
                success: false,
                message: "only admin can update coupon!"
            });
        };

        const coupon = await Coupon.findById(couponId);

        if(!coupon){
            return res.status(404).json({
                success: false,
                message: "Coupon not found!"
            });
        };

        const parsedResult = couponValidator.partial().safeParse(req.body);

        if(!parsedResult.success){
            return res.status(400).json({
                success: false,
                message: parsedResult.error.errors[0].message
            });
        };

        Object.assign(coupon, parsedResult.data);

        await coupon.save();

        return res.status(200).json({
            success: true,
            message: "Coupon updated successfully!",
            coupon
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error: error.message
        })
    }
}

async function deleteCoupon(req, res){

    try{
        const couponId = req.params.id;

        if(req.user.role !== "Admin"){
            return res.status(400).json({
                success: false,
                message: "Only admin can delete coupon!"
            });
        }

        const coupon = await Coupon.findById(couponId);

        if(!coupon){
            return res.status(404).json({
                success: false,
                message: "Coupon not found!"
            });
        }

        await Coupon.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Coupon deleted successfully!"
        })
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error: error.message
        })
    }
}

async function getAllCoupons(req, res){

    try{
        let coupons;

        if(req.user.role === "Admin"){
            coupons = await Coupon.find().populate("product").populate("category").populate("createdBy");
        } else {
            coupons = await Coupon.find({ active: true }).populate("product");
        }

        return res.status(200).json({
            success: true,
            message: "Coupons fetched successfully!",
            coupons
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error: error.message
        })
    }
};

async function getSingleCoupon(req, res){

    try{

        if(req.user.role ==="Admin"){
            return res.status(400).json({
                success: false,
                message: "Only customer can access!"
            })
        }

        const { couponId } = req.params;
        const now = Date();

        const coupon = await Coupon.findOne({
            _id: couponId,
            active: true,
            validFrom: {
                $lte: now
            },
            $or: [
                {
                    validUntil: null
                },
                {
                    validUntil: {
                        $gte: now
                    }
                }
            ]
        });

        if(!coupon){
            return res.status(404).json({
                success: false,
                message: "Coupon not found!"
            })
        }

        if(coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit){
            return res.status(400).json({
                success: false,
                message: "Coupon usage limit exceeded"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Coupon fetched successfully",
            data: {
                _id: coupon._id,
                coupon: coupon.code,
                description: coupon.description,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                minPurchase: coupon.minPurchase,
                validFrom: coupon.validFrom,
                validUntil: coupon.validUntil
            }
        })
    } catch(e){
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: e.message
        })
    }
}

async function applyCoupon(req, res){

    try{
        const { code, productId, orderAmount } = req.body;
        const now = new Date();

        const coupon = await Coupon.findOne({
            code: code.toUpperCase(),
            active: true,
            validFrom: {
                $lte: now
            },
            $or: [
                {
                    validUntil: null
                },
                {
                    validUntil: {
                        $gte: now
                    }
                }
            ]
        });

        if(!coupon){
            return res.status(404).json({
                success: false,
                message: "Invalid or expired coupon!"
            });
        };

        if(coupon.appliesTo === "products"){
            const allowedProducts = coupon.appliesIds.map(id => id.toString())

            if(!allowedProducts.includes(productId)){
                return res.status(400).json({
                    success: false,
                    message: "Coupon is not applicable to this product"
                })
            }
        }

        if(orderAmount < coupon.minPurchase){
            return res.status(400).json({
                success: false,
                message: `Minimum order amount must ${coupon.minPurchase}`
            })
        }

        if(coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit){
            return res.status(400).json({
                success: false,
                message: "Coupon usage limit exceeded"
            })
        }

        let discount = 0;

        if(coupon.discountType === "Fixed"){
            discount = coupon.discountValue;
        } else if(coupon.discountType === "Percent"){
            discount = (orderAmount * coupon.discountValue) / 100;
        };

        if(discount > orderAmount){
            discount = orderAmount
        }

        const finalAmount = orderAmount - discount;

        return res.status(200).json({
            success: true,
            message: "Coupon applied!",
            couponCode: coupon.code,
            discount,
            finalAmount
        });
    } catch(e){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error: e.message
        });
    };
};

export {
    createCoupon,
    updateCoupon,
    deleteCoupon,
    getAllCoupons,
    getSingleCoupon,
    applyCoupon
}