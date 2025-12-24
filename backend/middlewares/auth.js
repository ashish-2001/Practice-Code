import { jwt } from "jsonwebtoken";

async function auth(req, res, next){

    try{

        let token = null;

        if(req.cookies && req.cookies.token){
            token = req.cookies.token;
        } else if(req.headers.authorization && req.headers.authorization.startsWith("Bearer ")){
            token = req.headers.authorization.split(" ")[1];
        } else if(req.body && req.body.token){
            token = req.body.token;
        };

        if(!token){
            return res.status(401).json({
                success: false,
                message: "Unauthorized. Token not provided"
            });
        };

        const decoded = await jwt.verify(token, process.env.JWT_SECRET);

        console.log("Decoded data:", decoded);

        req.user = decoded;

        next();
    } catch(e){
        return res.status(500).json({
            success: false,
            message: "Interval server error!",
            error: e.message
        });
    };

};

async function isAdmin(req, res, next){

    try{

        if(!req.user || req.user.role !== "Admin"){
            return res.status(403).json({
                success: false,
                message: "This is a protected route for admin only!"
            });
        };

        next();

    } catch(e){
        return res.status(500).json({
            success: false,
            message: "Interval server error!",
            error: e.message
        });
    };

};

function isCustomer(req, res, next){

    try{

        if(!req.user || req.user.role !== "Customer"){
            return res.status(403).json({
                success: false,
                message: "This is a protected route for customer only!"
            });
        };

        next();

    } catch(e){
        return res.status(500).json({
            success: false,
            message: "Interval server error!",
            error: e.message
        });
    };

};


export {
    auth,
    isAdmin,
    isCustomer
}