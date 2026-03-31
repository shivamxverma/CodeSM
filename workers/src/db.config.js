import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const DATABASE_NAME = "codesm";

const connectDB = async () => {
    try {
        console.log("Connecting to MongoDB...");
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}${DATABASE_NAME}`);

        console.log(`MongoDB connected: ${connectionInstance.connection.host}`);

        console.log("Connection successful!");

    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    }
}

export default connectDB;