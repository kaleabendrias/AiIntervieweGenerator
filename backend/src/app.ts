import express, { type Application } from 'express';
import cors from 'cors';
import { env } from './config/env';
import questionsRoutes from './routes/questions.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { apiRateLimiter } from './middleware/rateLimiter';

export const createApp = (): Application => {
  const app = express();

  app.set('trust proxy', 1);

  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json({ limit: '32kb' }));
  app.use(requestLogger);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api', apiRateLimiter);
  app.use('/api/questions', questionsRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
