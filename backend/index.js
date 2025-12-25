import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { router as userRoute } from "./routes/userRoutes.js"
import { router as productRoute } from "./routes/productRoute.js"
import { router as contactRoute } from "./routes/contactRoutes.js";
import { router as profileRoute } from "./routes/profileRoutes.js"
import { databaseConnect } from "./config/database.js";
import dotenv from "dotenv";
import { cloudinaryConnect } from "./config/cloudinary.js";


dotenv.config();

const app = express();

databaseConnect();

const PORT = process.env.PORT || 4003;

const allowedOrigins = [
    // "http://localhost:5173",
    // "http://localhost:5175"

    "http://admin-prarabdh.in",
    "http://prarabdh.in"
]

app.use(cors({
    origin: function (origin, callback){
        if(!origin){
            return callback(null, true);
        }

        if(allowedOrigins.includes(origin)){
            return callback(null, true);
        } else{
            return callback(new Error("Cors blocked: " + origin));
        }
    },
    
    credentials: true
}));

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/temp"
}));

app.use(express.json());

app.use(urlencoded({
    extended: true
}));

app.use(cookieParser());

cloudinaryConnect();

app.use("/api/v1/auth", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/contact", contactRoute);
app.use("/api/v1/profile", profileRoute);

app.get("/", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Welcome to the api!"
    });
});

app.listen(PORT, () => {
    console.log(`App is running on  ${PORT}`);
});