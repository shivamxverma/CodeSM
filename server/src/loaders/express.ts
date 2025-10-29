import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import express from 'express';
import cookieParser from 'cookie-parser';
import routes from '../api';
import { apiPrefix } from '../utils/constants';
import env from '../config';

const corsOptions = {
    origin:
        env.NODE_ENV === 'production'
            ? env.ALLOWED_ORIGINS!.split(',')
            : [
                'http://localhost:3000',
            ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-HMAC-Signature'],
    exposedHeaders: [],
};



const app = express();

export default ({ app }: { app: express.Application }): void => {
    app.use(cors(corsOptions));
    app.options('*', cors(corsOptions));
    app.use(cookieParser());
    app.get('/', (req, res) => {
        return res.send(
            "What are you doing here? 🧐 Go to <a href='https://trench.ag/'>Magic Link!!</a>",
        )
    })

    app.get('/healthcheck', (req, res) => {
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