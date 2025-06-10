import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config({ path: './env' });



const app = express();
app.use(cors({
    origin : process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended: true, limit: '50mb'}));
app.use(cookieParser());
app.use(express.static('public'));

import userRoutes from './route/user.route.js';
import problemRoutes from './route/problem.route.js';

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/problem", problemRoutes);

export default app;