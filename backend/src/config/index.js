import yup from 'yup';
import dotenv from 'dotenv';
dotenv.config({});

const envSchema = yup.object({
    API_VERSION: yup.string().required(),

    ACCESS_TOKEN_EXPIRY: yup.string().required(),
    ACCESS_TOKEN_SECRET: yup.string().required(),

    REFRESH_TOKEN_EXPIRY: yup.string().required(),
    REFRESH_TOKEN_SECRET: yup.string().required(),

    PORT: yup.number().default(5000),

    DATABASE_URL: yup.string().required(),
    MONGO_URI: yup.string().required(),

    CLIENT_URL: yup.string().required(),
    VITE_API_URL: yup.string().required(),

    AWS_ACCESS_KEY_ID: yup.string().required(),
    AWS_SECRET_ACCESS_KEY: yup.string().required(),
    AWS_REGION: yup.string().required(),
    AWS_BUCKET_NAME: yup.string().required(),

    CLOUDINARY_API_KEY: yup.string().required(),
    CLOUDINARY_API_SECRET: yup.string().required(),

    GOOGLE_CLIENT_ID: yup.string().required(),
    GOOGLE_CLIENT_SECRET: yup.string().required(),
    GOOGLE_CALLBACK_URL: yup.string().required(),

    GEMINI_API_KEY: yup.string().required(),
    MURF_API_KEY: yup.string().required(),

    REDIS_HOST: yup.string().required(),
    REDIS_PORT: yup.number().required(),
    REDIS_URL: yup.string().required(),
    REDIS_USER: yup.string().required(),

    ALLOWED_ORIGINS: yup.string().required(),

    SMTP_VERIFY_URL: yup.string().required(),
    EMAIL_FROM: yup.string().required(),
    EMAIL_HOST: yup.string().required(),
    EMAIL_PORT: yup.number().required(),
    EMAIL_USER: yup.string().required(),
    EMAIL_PASS: yup.string().required(),

    IDEMPOTENCY_SUBMIT_TTL_SEC: yup.number().required(),
});

const parsedEnv = envSchema.validateSync(process.env, {
  abortEarly: false,
  stripUnknown: true,
});

const env = parsedEnv;

export default env;
