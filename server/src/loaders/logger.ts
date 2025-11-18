import winston from 'winston';
import RotateFile from 'winston-daily-rotate-file';

import { loggerConfig } from '../utils/constants';

const transports = [];

if (process.env.NODE_ENV !== 'development') {
    transports.push(new winston.transports.Console());

    const extraTransports: RotateFile[] = [
        new RotateFile({
            filename: './logs/error/error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            zippedArchive: true,
            format: winston.format.combine(
                winston.format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss',
                }),
                winston.format.errors({ stack: true }),
                winston.format.splat(),
                winston.format.json(),
            ),
        }),
        new RotateFile({
            filename: './logs/combined/combined-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
            format: winston.format.combine(
                winston.format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss',
                }),
                winston.format.errors({ stack: true }),
                winston.format.splat(),
                winston.format.json(),
            ),
        }),
    ];

    transports.push(...extraTransports);
} else {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.cli(),
        winston.format.splat(),
      ),
    }),
  );
}

const LoggerInstance = winston.createLogger({
  level: loggerConfig.level,
  levels: winston.config.npm.levels,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  ),
  transports,
});


export default LoggerInstance;