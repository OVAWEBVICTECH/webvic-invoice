import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { clientsRouter } from './clients.routes.js';
import { invoicesRouter } from './invoices.routes.js';
import { settingsRouter } from './settings.routes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/clients', clientsRouter);
apiRouter.use('/invoices', invoicesRouter);
apiRouter.use('/settings', settingsRouter);

export { apiRouter };
