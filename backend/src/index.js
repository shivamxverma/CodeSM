import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import Connect from '../utils/db.js';
import userRotuer from '../route/user.js';
// import ProblemRouter from '../route/problem.js';

Connect();

const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(cookieParser());

// app.use('/user', ProblemRouter);
app.use('/api', userRotuer);

app.listen(8000,()=>{
    console.log("Server is Started")
});