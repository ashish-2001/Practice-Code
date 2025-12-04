import { jwt } from "jsonwebtoken";


async function auth(req, res, next){

    try{
        const token = req.cookies.token || req.headers("Authorization").replace("Bearer ", "") || req.body.token;

        if(!token){
            return res.status(403).json({
                success: false,
                message: "Unauthorized!"
            });
        };

        const decode = await jwt.verify(token, process.env.JWT_SECRET);

        console.log("Decoded data:", decode);

        req.user = decode;

        next();
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Interval server error!",
            error: error.message
        });
    };
};

async function isAdmin(req, res, next){

    try{

        if(req.user.role !== "Admin"){
            return res.status(403).json({
                success: false,
                message: "Failed to sign in as admin"
            })
        }

        next();
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Interval server error!",
            error: error.message
        });
    };
};

function isCustomer(req, res, next){
    try{

        if(req.user.role !== "Customer"){
            return res.status(403).json({
                success: false,
                message: "Failed to sign in as customer!"
            });
        };

        next();
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Interval server error!",
            error: error
        });
    };
};
export {
    auth,
    isAdmin,
    isCustomer
}