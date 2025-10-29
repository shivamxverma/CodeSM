import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import express from 'express';
import cookieParser from 'cookie-parser';
import routes from '../api';
import { apiPrefix } from '../utils/constants';
import env from '../config';
import { db } from './postgres';
import { sql } from 'drizzle-orm';
import { getDrizzleClient } from './postgres';

const corsOptions = {
    origin:['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-HMAC-Signature'],
    exposedHeaders: [],
};



const app = express();

export default ({ app }: { app: express.Application }): void => {
    app.use(cors(corsOptions));
    // app.options('/*', cors(corsOptions));
    app.use(cookieParser());
    app.get('/', (req, res) => {
        return res.send(
            "What are you doing here? 🧐 Go to <a href='https://shivam.ag/'>Magic Link!!</a>",
        )
    })

    app.get('/hello-check',async (req,res) => {
        const db = await getDrizzleClient();
        const poolQuery = sql`SELECT 1`;
        const result = await db.execute(poolQuery);
        return res.json({message: "Hello Check!", result: result});
    })

    app.get('/healthcheck', (req, res) => {
        const healthcheck = {
            statusCode: 200,
            success: true,
            message: 'OK',
            timestamp: new Date(),
            uptime: process.uptime(),
            application: 'CODESM',
        };

        try {
            return res.json(healthcheck);
        } catch (e) {
            return res.status(503).send();
        }
    });

    app.use(morgan('dev'));

    app.set('trust proxy', 1);
    app.use(bodyParser.json());
    app.use(apiPrefix, routes());

    app.use((req, res, next) => {
        res.status(404).json({
            success: false,
            message: 'Resource not found',
        });
    });

    // app.use(errorConverter);
    // app.use(errorHandler);
}