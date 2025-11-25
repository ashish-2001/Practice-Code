import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function databaseConnect(){
    
    try{
        await mongoose.connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log("Database connected!");
    } catch(error){
        console.log(error);
        process.exit(1);
    }
}

export {
    databaseConnect
}