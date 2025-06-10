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

export default app;