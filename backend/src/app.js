import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { apiRouter } from './routes/index.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');

  // CSP is best set at the edge (CDN) and depends on deployment. Keep disabled here for API simplicity.
  app.use(helmet({ contentSecurityPolicy: false }));

  app.use(express.json({ limit: '200kb' }));
  app.use(express.urlencoded({ extended: false, limit: '200kb' }));
  app.use(cookieParser());

  const origin = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) : true;
  app.use(cors({ origin, credentials: true }));

  app.use(
    rateLimit({
      windowMs: 5 * 60 * 1000,
      limit: 300,
      standardHeaders: true,
      legacyHeaders: false
    })
  );

  app.get('/health', (req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

  app.use('/api', apiRouter);

  // 404
  app.use((req, res) => res.status(404).json({ error: 'Not found' }));

  // Central error handler
  app.use((err, req, res, next) => {
    console.error(err);
    const status = err.statusCode || err.status || 500;
    const message = status === 500 ? 'Internal server error' : (err.message || 'Request failed');
    res.status(status).json({ error: message });
  });

  return app;
}
