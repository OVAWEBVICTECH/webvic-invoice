import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { clientsRouter } from './clients.routes.js';
import { invoicesRouter } from './invoices.routes.js';
import { settingsRouter } from './settings.routes.js';

export const apiRouter = Router();

apiRouter.get('/', (req, res) => {
  res.json({
    name: 'InvoiceFlow API',
    version: '0.1.0',
    docs: 'See backend/README.md'
  });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/clients', clientsRouter);
apiRouter.use('/invoices', invoicesRouter);
apiRouter.use('/settings', settingsRouter);
