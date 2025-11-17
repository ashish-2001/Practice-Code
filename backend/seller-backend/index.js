import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { router as productRoutes } from "./src/routes/productRoutes.js";
import { databaseConnect } from "../../shared/config/database.js";
import { cloudinaryConnect } from "../../shared/config/cloudinary.js";

import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 4002;

const app = express();

databaseConnect();

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175"
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/temp"
}));

cloudinaryConnect();

app.use(express.json());

app.use(urlencoded({
    extended: true
}));

app.use(cookieParser());

app.use("/api/v1/product", productRoutes);

app.get("/", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Welcome to the app!"
    });
});

app.listen(PORT, ()=> {
    console.log(`App is running on port ${PORT}`);
});

