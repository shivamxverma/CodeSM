import env from '../config/index.js';
export const DATABASE_NAME = "codesm";
export const loggerConfig = {
    level: env.LOG_LEVEL || 'info',
};

export function parsePositiveInt(name, fallback) {
  const v = parseInt(env[name] || String(fallback), 10);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

export const SANDBOX_MEMORY      = env.SANDBOX_MEMORY     || '256m';
export const SANDBOX_CPUS        = env.SANDBOX_CPUS       || '0.5';
export const SANDBOX_PIDS_LIMIT  = env.SANDBOX_PIDS_LIMIT || '64';
export const COMPILE_TIMEOUT_SEC = parsePositiveInt('COMPILE_TIMEOUT_SEC', 60);
export const RUN_TIMEOUT_SEC     = parsePositiveInt('RUN_TIMEOUT_SEC', 2);
export const MAX_PROGRAM_OUTPUT_BYTES = parsePositiveInt('MAX_PROGRAM_OUTPUT_BYTES', 256 * 1024);

export const apiPrefix = '/api' + `/${env.API_VERSION}`;