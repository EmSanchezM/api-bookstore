import { createLogger, format, transports } from 'winston';
const { combine, timestamp, json, colorize, errors } = format;

const consoleLogFormat = format.combine(
  colorize(),
  timestamp(),
  format.printf(({ level, message, timestamp }) => {
    return `[${level}] ${message}`;
  }),
);

export const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(timestamp(), errors({ stack: process.env.NODE_ENV !== 'production' }), json()),
  transports: [
    new transports.Console({
      format: consoleLogFormat,
    }),
  ],
});
