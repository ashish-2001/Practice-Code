import express, { urlencoded } from "express";
import fileUpload from "express-fileupload";
import cookieParser from "cookie-parser";
import cors from "cors";
import { databaseConnect } from "../../shared/config/database";
import { router as categoryRoutes } from "../admin-backend/src/routes/categoryRoutes.js";
import { cloudinaryConnect } from "../../shared/config/cloudinary";
import dotenv from "dotenv"
dotenv.config();

const app = express();

const PORT = process.env.PORT || 4000;

databaseConnect();

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175"
];

app.use(cors({
    origins: allowedOrigins,
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

app.use("/api/v1/category", categoryRoutes);

app.get("/", (req, res)=>{
    return res.status(200).json({
        success: true,
        message: "Welcome to the api!"
    });
});

app.listen(PORT, ()=> {
    console.log(`App is running on Port ${PORT}`);
});

