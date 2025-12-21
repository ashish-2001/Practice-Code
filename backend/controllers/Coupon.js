import z from "zod";
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
        const coupons = req.user.role === "Admin" 
            ? await Coupon.find().populate("createdBy") 
            : await Coupon.find({ active: true })

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
        const { code, categoryId, productId, orderAmount } = req.body;
        const userId = req.user._id;
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

        if(coupon.appliesTo === "products" && !coupon.appliesIds.map(id => id.toString()).includes(productId)){
            return res.status(400).json({
                success: false,
                message: "Coupon not valid for this product"
            })
        }

        if(coupon.appliesTo === "categories" && !coupon.appliesIds.map(id => id.toString()).includes(categoryId)){
            return res.status(400).json({
                success: false,
                message: "Coupon not valid for this category"
            })
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

        let usage = await CouponUsage.findOne({
            user: userId,
            coupon: coupon._id
        });

        if(!usage){
            usage = await CouponUsage.create({
                user: userId,
                coupon: coupon._id,
                usedCount: 0
            });
        }

        if(usage.usedCount >= coupon.perUserLimit){
            return res.status(400).json({
                message: "You already have used it maximum times!"
            })
        }

        let discount = coupon.discountType === "Fixed"
                        ? coupon.discountType
                        : (orderAmount * coupon.discountValue) / 100;

        discount = Math.min(discount, orderAmount);
        const finalAmount = orderAmount - discount

        coupon.usedCount += 1;
        await coupon.save();

        return res.status(200).json({
            success: true,
            message: "Coupon applied!",
            couponCode: coupon.code,
            discount,
            finalAmount,
            remainingUses: coupon.perUserLimit - coupon.usedCount
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