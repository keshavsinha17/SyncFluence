import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { DB_NAME } from "../../constant.js";

const connectDB = async () => {
    try {
        const connectInsatance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log("Connected to MongoDB");
        // console.log(`database host: ${connectInsatance.connection.host}`);
        
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};

export default connectDB;