import env from '../config';

export const apiPrefix = '/api' + `/${env.API_VERSION}`;
export const loggerConfig = {
  level: env.LOG_LEVEL || 'info',
};

