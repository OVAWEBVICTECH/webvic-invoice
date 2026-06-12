import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { Decimal } from '@prisma/client/runtime/library.js';

const router = Router();

const InvoiceItemSchema = z.object({
  description: z.string().min(1).max(500),
  qty: z.number().int().positive(),
  price: z.number().positive()
});

const InvoiceSchema = z.object({
  clientId: z.string().uuid(),
  number: z.string().min(1).max(50),
  dueDate: z.string().datetime(),
  notes: z.string().max(2000).optional(),
  items: z.array(InvoiceItemSchema).min(1)
});

// GET /api/invoices
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { userId: req.user.id },
      include: { items: true, client: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ invoices });
  } catch (err) {
    next(err);
  }
});

// GET /api/invoices/:id
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { items: true, client: true }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({ invoice });
  } catch (err) {
    next(err);
  }
});

// POST /api/invoices
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { clientId, number, dueDate, notes, items } = InvoiceSchema.parse(req.body);

    // Verify client belongs to user
    const client = await prisma.client.findFirst({
      where: { id: clientId, userId: req.user.id }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Check invoice number uniqueness
    const existing = await prisma.invoice.findFirst({
      where: { userId: req.user.id, number }
    });

    if (existing) {
      return res.status(409).json({ error: 'Invoice number already exists' });
    }

    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.qty * item.price), 0);

    const invoice = await prisma.invoice.create({
      data: {
        userId: req.user.id,
        clientId,
        number,
        dueDate: new Date(dueDate),
        notes: notes || '',
        total: new Decimal(total.toFixed(2)),
        items: {
          create: items.map(item => ({
            description: item.description,
            qty: item.qty,
            price: new Decimal(item.price.toFixed(2)),
            subtotal: new Decimal((item.qty * item.price).toFixed(2))
          }))
        }
      },
      include: { items: true }
    });

    res.status(201).json({ invoice });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', issues: err.issues });
    }
    next(err);
  }
});

// PATCH /api/invoices/:id/status
router.patch('/:id/status', requireAuth, async (req, res, next) => {
  try {
    const { status } = z.object({ status: z.enum(['pending', 'paid', 'overdue']) }).parse(req.body);

    const invoice = await prisma.invoice.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const updated = await prisma.invoice.update({
      where: { id: req.params.id },
      data: {
        status,
        paidAt: status === 'paid' ? new Date() : null
      },
      include: { items: true }
    });

    res.json({ invoice: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    next(err);
  }
});

// DELETE /api/invoices/:id
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    await prisma.invoice.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export const invoicesRouter = router;
