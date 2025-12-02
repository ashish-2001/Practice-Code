import z from "zod";
import { User } from "../models/User";
import { Coupon } from "../models/Coupon";
import { Product } from "../models/Product";
import { Category } from "../models/Category";

const couponValidator = z.object({
    code: z.string().min(5).max(10).transform(val => val.toUpperCase()).refine(val => /^[A-Z0-9]+$/.test(val), {
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

async function createCoupon(req, res){

    try{

        if(req.user.role === "Customer"){
            return res.status(400).json({
                success: false,
                message: "Customer cannot create coupon!"
            });
        };

        const parsedResult = couponValidator.safeParse(req.body);

        if(!parsedResult.success){
            return res.status(400).json({
                success: false,
                message: "All fields are required!"
            });
        };

        const {
            product,
            category,
            code
        } = parsedResult.data;

        const productData = await Product.findById(product);

        if(!productData){
            return res.status(404).json({
                success: false,
                message: "Product not found!"
            });
        }

        const categoryData = await Category.findById(category);

        if(!categoryData){
            return res.status(404).json({
                success: false,
                message: "Category not found!"
            });
        };

        if(String(productData.category) !== String(category)){
            return res.status(400).json({
                success: false,
                message: "This product does not belong to the selected category!"
            })
        }

        const already = await Coupon.findOne({
            code,
            product
        });

        if(already){
            return res.status(400).json({
                success: false,
                message: "Coupon already exists for this product!"
            });
        };

        const coupon = await Coupon.create({
            ...parsedResult.data,
            createdBy: req.user._id
        });

        return res.status(200).json({
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

async function editCoupon(req, res){

    try{
        const couponId = req.params.id;

        if(req.user.role === "Customer"){
            return res.status(400).json({
                success: false,
                message: "Customer cannot create coupon!"
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
                message: "All fields are required!"
            });
        };

        const updates = parsedResult.data;

        if(updates.code){
            updates.code = updates.code.toUpperCase();

            const exists = await Coupon.findOne({
                code: updates.code,
                _id: {
                    $ne: couponId
                }
            })

            if(exists){
                return res.status(409).json({
                    success: false,
                    message: "This coupon code already exists!"
                });
            };
        }

        if(updates.product || updates.category){
            const productId = updates.product || coupon.product;
            const categoryId = updates.category || coupon.category;

            const productData = await Product.findById(productId);
            const categoryData = await Category.findById(categoryId);

            if(!productData || !categoryData){
                return res.status(404).json({
                    success: false,
                    message: "Invalid product or category!"
                });
            };

            if(String(productData.category) !== String(categoryId)){
                return res.status(400).json({
                    success: false,
                    message: "The product does not belong to this category!"
                });
            };

            updates.product = productId;
            updates.category = categoryId;
        };

        Object.assign(coupon, updates);

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

        if(req.user.role === "Customer"){
            return res.status(400).json({
                success: false,
                message: "Customer cannot delete coupon!"
            });
        }

        const coupon = await  Coupon.findById(couponId);

        if(!coupon){
            return res.status(404).json({
                success: false,
                message: "Coupon not found!"
            });
        }

        await Coupon.deleteOne({ _id: couponId });

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
}

async function applyCoupon(req, res){

    try{
        const { code, productId, orderAmount } = req.body;

        const coupon = await Coupon.findOne({ code });

        if(!coupon){
            return res.status(404).json({
                success: false,
                message: "Coupon not found!"
            });
        };

        if(new Date(coupon.expiry) < new Date()){
            return res.status(400).json({
                success: false,
                message: "Coupon has expired!"
            });
        };

        if(!coupon.active){
            return res.status(400).json({
                success: false,
                message: "Coupon is not active!"
            });
        };

        if(String(coupon.product) !== String(productId)){
            return res.status(400).json({
                success: false,
                message: "Coupon is not valid for this product!"
            });
        };

        if(orderAmount < coupon.minOrderAmount){
            return res.status(400).json({
                success: false,
                message: `Minimum order amount must be ₹${coupon.minOrderAmount}`
            });
        };

        let discount = 0;

        if(coupon.discountType === "Flat"){
            discount = coupon.discountValue;
        } else{
            discount = (orderAmount * coupon.discountValue) / 100;
        };

        if(coupon.maxDiscount && discount > coupon.maxDiscount){
            discount = coupon.maxDiscount;
        };

        const finalAmount = orderAmount - discount;

        return res.status(200).json({
            success: true,
            message: "Coupon applied!",
            finalAmount
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error: error.message
        });
    };
};

export {
    createCoupon,
    editCoupon,
    deleteCoupon,
    getAllCoupons,
    applyCoupon
}