import * as yup from 'yup';
import dotenv from 'dotenv';
dotenv.config();

const envSchema = yup.object({
    AWS_ACCESS_KEY_ID: yup.string().required(),
    AWS_BUCKET_NAME: yup.string().required(),
    AWS_REGION: yup.string().required(),
    AWS_SECRET_ACCESS_KEY: yup.string().required(),

    DATABASE_URL: yup.string().required(),
    REDIS_URL: yup.string().required(),
    MONGO_URI: yup.string().required(),
    CPP_RUNNER_IMAGE: yup.string().required(),
    SANDBOX_MEMORY: yup.string().required(),

    SANDBOX_CPUS: yup.string().required(),
    SANDBOX_PIDS_LIMIT: yup.string().required(),
    CPP_RUN_TIMEOUT_SEC: yup.string().required(),
    CPP_COMPILE_TIMEOUT_SEC: yup.string().required(),
    MAX_TESTCASE_INPUT_BYTES: yup.string().required(),


    MAX_PROGRAM_OUTPUT_BYTES: yup.string().required()
})

const parsedEnv = envSchema.validateSync(process.env, {
  abortEarly: false,
  stripUnknown: true,
});

const env = parsedEnv;

export default env;
