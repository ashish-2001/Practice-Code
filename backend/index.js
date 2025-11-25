import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { databaseConnect } from "./config/database.js";
import dotenv from "dotenv";
import { cloudinaryConnect } from "./config/cloudinary.js";


dotenv.config();

const app = express();

databaseConnect();

const PORT = process.env.PORT || 4003;

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175"
]

app.use(cors({
    origin: allowedOrigins,
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


app.get("/", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Welcome to the api!"
    });
});

app.listen(PORT, () => {
    console.log(`App is running on  ${PORT}`);
});