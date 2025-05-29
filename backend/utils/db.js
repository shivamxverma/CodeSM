import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const Connect = async()=>{
    try {
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL is not defined in the environment variables');
        }
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('Database connected successfully');
    } catch(error){
        console.error('Database connection failed:', error.message);
    }
}

export default Connect;