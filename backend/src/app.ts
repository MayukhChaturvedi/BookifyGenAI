import express from 'express';
import { errorHandler } from './middlewares/errorHandler.js';
import userRouter from './routes/userRouter.js';
import bookRouter from './routes/bookRouter.js';
import bookInstanceRouter from './routes/bookInstanceRouter.js';
import authorRouter from './routes/authorRouter.js';
import genreRouter from './routes/genreRouter.js';
import chatRouter from './routes/chatRouter.js';
import studyPlanRouter from './routes/studyPlanRouter.js';
import { authenticate } from './controllers/userController.js';
import cors from 'cors';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { httpLogger } from './config/logger.js';

const logDir = path.join(process.cwd(), 'logs');
const instanceId = process.pid;

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN
      : 'http://localhost:5173', // Default to allowing only http://localhost:5173
  }),
);

app.use(httpLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', authenticate);
app.use('/api/books', bookRouter);
app.use('/api/bookinstances', bookInstanceRouter);
app.use('/api/authors', authorRouter);
app.use('/api/genres', genreRouter);
app.use('/api/chat', chatRouter);
app.use('/api/study-plan', studyPlanRouter);
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

export default app;
