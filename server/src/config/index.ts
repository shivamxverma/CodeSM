import dotenv from 'dotenv';
import path from 'path';
import * as yup from 'yup';

dotenv.config({ path: path.join(__dirname, '../../.env') })

const envSchema = yup.object().shape({
    NODE_ENV: yup
        .string()
        .oneOf(['development', 'production'])
        .default('development'),
    DATABASE_URL: yup.string().required('Database URL is required'),
    PORT: yup.string().default('3000'),
    JWT_SECRET: yup.string().required(),
    JWT_REFRESH_SECRET: yup.string().required(),
    INTERNAL_API_KEY: yup.string().required(),
    ALLOWED_ORIGINS: yup.string(),
    API_VERSION: yup.string().default('v1'),
    LOG_LEVEL : yup
        .string()
        .oneOf(['error','warn','info','http','verbose','debug','silly'])
        .default('info'),
    REDIS_URL: yup.string().required(),
    AWS_REGION : yup.string().required(),
    AWS_ACCESS_KEY_ID : yup.string().required(),
    AWS_SECRET_ACCESS_KEY : yup.string().required(),
    AWS_BUCKET_NAME : yup.string().required(),
    CLIENT_URL : yup.string().required(),
    GEMINI_API_KEY : yup.string().required(),
    MURF_API_KEY : yup.string().required(),
})

const parsedEnv = envSchema.validateSync(process.env, {
  abortEarly: false,
  stripUnknown: true,
});


const env = parsedEnv;

export default env;
