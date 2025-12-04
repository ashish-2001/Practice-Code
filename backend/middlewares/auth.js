import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

async function auth(req, res, next){

    const token = req.cookies.token || req.headers("Authorization").replace("Bearer ", "") || req.body.token;

    if(!token){
        return res.status(403).json({
            success: false,
            message: "Token missing!"
        });
    };

    try{
        const decode = jwt.verify(token, process.env.JWT_SECRET);

        console.log("Decoded:", decode);

        req.user = decode;

        next();
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!", 
            error
        });
    };
}

async function isAdmin(req, res, next){

    try{
        
        if(req.user.role !== "Admin"){
            return res.status(403).json({
                success: false,
                message: "This is a protected route for Admin only"
            });
        };

        next();
        
    }catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error
        });
    };

}

async function isCustomer(req, res, next){
    
    try{
        if(req.user.role !== "Customer"){
            return res.status(403).json({
                success: false,
                message: "This is a protected route for Customer only!"
            });
        };

        next();

    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error
        });
    };
}

export {
    auth,
    isAdmin,
    isCustomer
}