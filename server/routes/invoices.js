import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

/**
 * GET /api/invoices
 * Return all invoices with client name, sorted by invoiceDate descending.
 */
router.get('/', async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { client: { select: { name: true } } },
      orderBy: { invoiceDate: 'desc' },
    });

    return res.json({ invoices });
  } catch (err) {
    console.error('GET /api/invoices error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

/**
 * GET /api/invoices/:id/pdf
 * Download the PDF for a specific invoice.
 */
router.get('/:id/pdf', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid invoice ID' });
    }

    const invoice = await prisma.invoice.findUnique({ where: { id } });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    if (!invoice.pdfPath) {
      return res.status(404).json({ error: 'PDF not available for this invoice' });
    }

    return res.download(invoice.pdfPath);
  } catch (err) {
    console.error('GET /api/invoices/:id/pdf error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

/**
 * GET /api/clients
 * Return all clients with their invoice count.
 */
router.get('/clients', async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      include: { _count: { select: { invoices: true } } },
      orderBy: { name: 'asc' },
    });

    return res.json({
      clients: clients.map((c) => ({
        id: c.id,
        name: c.name,
        createdAt: c.createdAt,
        invoiceCount: c._count.invoices,
      })),
    });
  } catch (err) {
    console.error('GET /api/clients error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

export default router;
