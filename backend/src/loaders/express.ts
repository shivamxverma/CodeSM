import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import routes from '../api';
import {rateLimitMiddleware} from '../middlewares/ratelimiter.middleware';
import { apiPrefix } from '../utils/constants';
import cookieParser from 'cookie-parser';
import env from '../config';

const corsOptions = {
    origin : 
     env.NODE_ENV === 'production'
       ? env.ALLOWED_ORIGINS!.split(',')
       : ['http://localhost:5173','https://code-sm.vercel.app'],
    credentials: true,
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-HMAC-Signature'],
    exposedHeaders: [],
}

export default ({ app }: { app : express.Application }) : void => {
    app.use(express.json());
    app.use(cors(corsOptions));
    app.options('', cors(corsOptions));
    app.use(cookieParser());

    // app.use(rateLimitMiddleware);
    app.get('/', (req, res) => {
        return res.status(200).send(
        "What are you doing here? 🧐 Go to <a href='https://dev.verlyai.xyz/'>Magic Link!!</a>"
        );
    });

    app.get('/health', (req, res) => {
        const healthcheck = {
          statusCode: 200,
          success: true,
          message: 'OK',
          timestamp: new Date(),
          uptime: process.uptime(),
          application: 'WHALE-TERMINAL',
        };
    
        try {
          return res.json(healthcheck);
        } catch (e) {
          return res.status(503).send();
        }
    });

    app.set('trust proxy', 1);

    app.use(apiPrefix, routes());

    app.use((req, res, next) => {
        res.status(404).json({
          success: false,
          message: 'Resource not found',
        });
    });
}


