import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
    try {
        console.log("Connecting to MongoDB...");
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/codesm`);
        console.log(`MongoDB connected: ${connectionInstance.connection.host}`);
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("Collections in the database:");
        console.log(collections);
        console.log("Connection successful!");
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    }
}

export default connectDB;