import crypto from "crypto";

function verifyRazorpayWebhook(req){
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto.createHmac("sha256", secret)
    .update(JSON.stringify(req.body)).digit("hex");

    return expectedSignature === signature;
}

export {
    verifyRazorpayWebhook
};