import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';

export const winstonLogger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        nestWinstonModuleUtilities.format.nestLike('ServiceA', {
          prettyPrint: true,
        }),
      ),
    }),
    // everything
    new winston.transports.File({ filename: 'logs/combined.log' }),
    // just errors
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  ],
});
