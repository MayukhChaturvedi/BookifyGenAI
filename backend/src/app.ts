import express from 'express';
import { errorHandler } from './middlewares/errorHandler.js';
import userRouter from './routes/userRouter.js';
import bookRouter from './routes/bookRouter.js';
import bookInstanceRouter from './routes/bookInstanceRouter.js';
import authorRouter from './routes/authorRouter.js';
import genreRouter from './routes/genreRouter.js';
import chatRouter from './routes/chatRouter.js';
import { authenticate } from './controllers/userController.js';
import cors from 'cors';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import rateLimit from 'express-rate-limit';

const logDir = path.join(process.cwd(), 'logs');
const instanceId = process.pid; // or use Date.now() for more uniqueness

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new DailyRotateFile({
      filename: path.join(logDir, `error-%DATE%-${instanceId}.log`),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '14d',
      zippedArchive: true,
    }),
    new DailyRotateFile({
      filename: path.join(logDir, `combined-%DATE%-${instanceId}.log`),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      zippedArchive: true,
    }),
  ],
});

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN
      : 'http://localhost:5173', // Default to allowing only http://localhost:5173
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', authenticate);
app.use('/api/books', bookRouter);
app.use('/api/bookinstances', bookInstanceRouter);
app.use('/api/authors', authorRouter);
app.use('/api/genres', genreRouter);
app.use('/api/chat', chatRouter);
app.use('/auth', userRouter);
app.use(errorHandler);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  }),
);

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}

export default app;
