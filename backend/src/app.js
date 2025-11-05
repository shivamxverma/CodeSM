import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config({ path: './env' });

const app = express();
app.set('trust proxy', 1);

const corsOptions = {
  origin: process.env.CLIENT || 'http://localhost:5173', 
  credentials: true, 
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};

app.use(cors(corsOptions));


app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended: true, limit: '50mb'}));
app.use(cookieParser());
app.use(express.static('public'));

import userRoutes from './routes/user.route.js';
import problemRoutes from './routes/problem.route.js';
import submissionRoutes from './routes/submission.route.js';
import contestRoutes from './routes/contest.route.js';
import interviewRoutes from './routes/interview.route.js';
import discussionRoutes from './routes/discussion.route.js';
import jobRoutes from './routes/job.route.js';

app.use("/api/v1/discussion", discussionRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/problem", problemRoutes);
app.use("/api/v1/submission", submissionRoutes);
app.use("/api/v1/contest", contestRoutes);
app.use("/api/v1/interview", interviewRoutes);
app.use("/api/v1/job", jobRoutes);

export default app;