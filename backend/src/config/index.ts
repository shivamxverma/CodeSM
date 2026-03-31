import dotenv from 'dotenv';
import path from 'path';
import * as yup from 'yup';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envSchema = yup.object().shape({
    NODE_ENV : yup.string().oneOf(['dev','production']).default('dev'),
    DATABASE_URL : yup.string().required('Database URL is Required'),
    PORT : yup.string().default('8000'),
    ALLOWED_ORIGINS: yup.string(),
    // JWT_SECRET : yup.string().required(),
    // JWT_REFRESH_SECRET: yup.string().required(),
    GOOGLE_CLIENT_ID: yup.string().required(),
    GOOGLE_CLIENT_SECRET: yup.string().required(),
    GOOGLE_CALLBACK_URL: yup.string().required(),
    GEMINI_API_KEYS: yup.string().optional(),
    // GOOGLE_CALLBACK_URL : yup.string().required(),
    LOG_LEVEL: yup
    .string()
    .oneOf(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'])
    .default('info'),
    API_VERSION: yup.string().default('v1'),
    MAX_API_REQUEST_RETRIES: yup.number().integer().default(3),
    CLIENT_URL : yup.string().default('https://code-sm.vercel.app'),
    MURF_API_KEY : yup.string().optional(),
    REDIS_HOST: yup.string().required(),
    REDIS_PASSWORD: yup.string().required(),
    REDIS_PORT: yup.string().required(),
    REDIS_USER: yup.string().required(),
    REFRESH_TOKEN_EXPIRY: yup.string().required(),
    REFRESH_TOKEN_SECRET: yup.string().required(),
    MONGO_URI : yup.string().required(),
    ACCESS_TOKEN_EXPIRY: yup.string().required(),
    ACCESS_TOKEN_SECRET: yup.string().required(),
    AWS_ACCESS_KEY_ID: yup.string().required(),
    AWS_BUCKET_NAME: yup.string().required(),
    AWS_REGION : yup.string().required(),
    VITE_API_URL : yup.string().required(),
    EMAIL_FROM: yup.string().required(),
    EMAIL_HOST: yup.string().required(),
    EMAIL_PASS: yup.string().required(),
    EMAIL_PORT: yup.number().required(),
    EMAIL_USER: yup.string().required(),
    SMTP_VERIFY_URL : yup.string().required()
})

const parsedEnv = envSchema.validateSync(process.env, {
    abortEarly: false,
    stripUnknown: true
});

const env = parsedEnv;

export default env;
