import { success } from "zod";

async function capturePayment(req, res){
    try{

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

    } catch(e){
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: e.message
        });
    };
};

async function sendPaymentSuccessfulEmail(req, res){
    try{

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