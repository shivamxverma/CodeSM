import { adjectives, Config, nouns } from 'unique-username-generator';
import env from '../config/index';
export const DATABASE_NAME = "codesm";
export const loggerConfig = {
    level: env.LOG_LEVEL || 'info',
};

export const apiPrefix = '/api' + `/${env.API_VERSION}`;

export const usernameGeneratorConfig = {
  dictionaries: [adjectives, nouns],
};
