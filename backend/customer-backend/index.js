import express, { urlencoded } from "express";
import { databaseConnect } from "../../shared/config/database.js";
import { cloudinaryConnect } from "../../shared/config/cloudinary.js";
import { router as productRoutes} from "../customer-backend/src/routes/getProductRoutes.js"
import cors from "cors";
import fileUpload from "express-fileupload";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();


const app = express();

const PORT = process.env.PORT || 4001;

databaseConnect();

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
]
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

app.use("/api/v1/product", productRoutes);

app.get("/", (req, res)=> {
    return res.status(200).json({
        success: true,
        message: "Welcome to the api!"
    });
});

app.listen(PORT, () => {
    console.log(`App is running on PORT ${PORT}`);
})
