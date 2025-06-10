import express from 'express';
import cors from 'cors';
import CookieParser from 'cookie-parser';

const app = express();
app.use(cors({
    origin : process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended: true, limit: '50mb'}));
app.use(CookieParser());
app.use(expressstatic('public'));

import userRoutes from './route/user.route.js';
import problemRoutes from './route/problem.route.js';

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/problem", problemRoutes);

export default app;