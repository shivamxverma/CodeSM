import mongoose from "mongoose";
import { DATABASE_NAME } from "../constants.js";
import { seedAdmin } from "../scripts/seed-admin.js";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
    try {
        console.log("Connecting to MongoDB...");
        console.log(`MongoDB URI: ${process.env.MONGO_URI}${DATABASE_NAME}`);
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}${DATABASE_NAME}`);

        // seedAdmin()
        // .then(() => {
        //     console.log("Admin is Seeded");
        // })
        // .catch(() => {
        //     console.log("Error while seeding the admin");
        // })

        console.log(`MongoDB connected: ${connectionInstance.connection.host}`);

        console.log("Connection successful!");

    } catch(err){
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    }
}

export default connectDB;