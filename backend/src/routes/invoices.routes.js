import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

export const invoicesRouter = Router();
invoicesRouter.use(requireAuth);

const itemSchema = z.object({
  description: z.string().trim().min(1).max(200),
  qty: z.number().int().min(1).max(9999),
  price: z.number().min(0).max(999999.99)
});

const createInvoiceSchema = z.object({
  number: z.string().trim().min(1).max(40),
  clientId: z.string().uuid(),
  dueDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  notes: z.string().trim().max(500).optional().nullable(),
  items: z.array(itemSchema).min(1).max(200)
});

function parseDueDate(input) {
  // Accept YYYY-MM-DD or ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return new Date(input + 'T00:00:00.000Z');
  return new Date(input);
}

invoicesRouter.get('/', async (req, res) => {
  const invoices = await prisma.invoice.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    include: { client: true, items: true }
  });
  res.json({ invoices });
});

invoicesRouter.get('/:id', async (req, res, next) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const invoice = await prisma.invoice.findFirst({
      where: { id, userId: req.user.id },
      include: { client: true, items: true }
    });
    if (!invoice) return res.status(404).json({ error: 'Not found' });
    res.json({ invoice });
  } catch (e) {
    if (e?.name === 'ZodError') return res.status(400).json({ error: 'Invalid input' });
    next(e);
  }
});

invoicesRouter.post('/', async (req, res, next) => {
  try {
    const parsed = createInvoiceSchema.parse(req.body);

    const client = await prisma.client.findFirst({ where: { id: parsed.clientId, userId: req.user.id } });
    if (!client) return res.status(400).json({ error: 'Invalid clientId' });

    const computedItems = parsed.items.map(it => {
      const subtotal = Number((it.qty * it.price).toFixed(2));
      return { ...it, subtotal };
    });
    const total = Number(computedItems.reduce((sum, it) => sum + it.subtotal, 0).toFixed(2));

    const invoice = await prisma.invoice.create({
      data: {
        userId: req.user.id,
        clientId: parsed.clientId,
        number: parsed.number,
        dueDate: parseDueDate(parsed.dueDate),
        notes: parsed.notes || null,
        total,
        items: {
          create: computedItems.map(it => ({
            description: it.description,
            qty: it.qty,
            price: it.price,
            subtotal: it.subtotal
          }))
        }
      },
      include: { items: true, client: true }
    });

    res.status(201).json({ invoice });
  } catch (e) {
    if (e?.name === 'ZodError') return res.status(400).json({ error: 'Invalid input' });
    if (e?.code === 'P2002') return res.status(409).json({ error: 'Invoice number already exists' });
    next(e);
  }
});

invoicesRouter.patch('/:id/status', async (req, res, next) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const status = z.enum(['pending', 'paid', 'overdue']).parse(req.body?.status);

    const data = { status };
    if (status === 'paid') data.paidAt = new Date();

    const invoice = await prisma.invoice.update({
      where: { id, userId: req.user.id },
      data,
      include: { items: true, client: true }
    });

    res.json({ invoice });
  } catch (e) {
    if (e?.name === 'ZodError') return res.status(400).json({ error: 'Invalid input' });
    if (e?.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    next(e);
  }
});

invoicesRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    await prisma.invoice.delete({ where: { id, userId: req.user.id } });
    res.json({ ok: true });
  } catch (e) {
    if (e?.name === 'ZodError') return res.status(400).json({ error: 'Invalid input' });
    if (e?.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    next(e);
  }
});
