import z from "zod";
import { Product } from "../models/Product";
import { User } from "../models/User.js";
import { mailSender } from "../utils/mailSender";
import { instance } from "../config/razorpay.js";
import { paymentSuccessful } from "../mail/templates/paymentSuccessful.js";
import { crypto } from "crypto";

const productValidator = z.object({
    products: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid course ID")).min(1, "At least one product is required")
});

async function capturePayment(req, res){
    try{

        const parsedResult = productValidator.safeParse(req.body);

        if(!parsedResult.success){
            return res.status(400).success({
                success: false,
                message: "All fields are required!"
            });
        };
        
        const { products } = parsedResult.data;

        let totalAmount = 0;

        for(const productId of products){
            const product = await Product.findById(productId);

            if(!product){
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                })
            }

            totalAmount += product.price;
        }

        const options = {
            amount: totalAmount * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        }

        const order = await instance.orders.create(options);

        return res.status(200).json({
            success: false,
            message: "Product purchased successfully",
            orderId: order.id,
            amount: order.amount,
            currency: order.currency
        });
    } catch(e){
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: e.message
        });
    };
};

async function verifyPayment(req, res){
    try{

        const { razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            products
        } = req.body;

        const userId = req.user._id;

        if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !products || !userId){
            return res.status(400).json({
                success: false,
                message: "Payment verification failed!"
            });
        };

        const body = `${razorpay_order_id}|${razorpay_payment_id}`;

        const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET).update(body).digest("hex");

        if(expectedSignature !== razorpay_signature){
            return res.status(403).json({
                success: false,
                message: "Invalid payment signature"
            });
        };

        await userPurchased(products, userId);

        return res.status(200).json({
            success: false,
            message: "Payment verified successfully"
        });
    } catch(e){
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: e.message
        });
    };
};

async function userPurchased(products, userId){
    for(const productId of products){
        await Product.findByIdAndUpdate(productId, {
            $push: { userPurchases: userId }
        });

        await User.findByIdAndUpdate(userId, {
            $push: { products: productId }
        })
    };
};

async function sendPaymentSuccessfulEmail(req, res){
    try{
        const { orderId, paymentId, amount } = req.body;

        const userId = req.user._id;

        if(!orderId || !paymentId || !amount || !userId){
            return res.status(400).json({
                success: false,
                message: "All fields are required!"
            });
        };

        const user = await User.findById(userId);

        await mailSender(
            user.email,
            "Payment Successful",
            paymentSuccessful(
                `${user.name}`,
                amount / 100,
                orderId,
                paymentId
            )
        );

        return res.status(200).json({
            success: true,
            message: "Payment email sent successfully"
        });
    } catch(e){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error: e.message
        })
    }
}

export {
    capturePayment,
    verifyPayment,
    sendPaymentSuccessfulEmail
}