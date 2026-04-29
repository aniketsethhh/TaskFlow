import { Router } from 'express';
import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../lib/prisma.js';
import { generateInvoiceHTML } from '../lib/invoiceTemplate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

/**
 * POST /api/tasks
 * Create an invoice from a task submission.
 *
 * Body: { taskName, hoursWorked, hourlyRate, clientName, currency, gstEnabled }
 */
router.post('/', async (req, res) => {
  try {
    const { taskName, hoursWorked, hourlyRate, clientName, currency, gstEnabled } = req.body;

    // ── Validate required fields ──────────────────────────────────────
    if (!taskName || !clientName || !hoursWorked || !hourlyRate || !currency) {
      return res.status(400).json({ error: 'Missing required fields: taskName, clientName, hoursWorked, hourlyRate, currency' });
    }

    if (hoursWorked < 0.5) {
      return res.status(400).json({ error: 'hoursWorked must be at least 0.5' });
    }

    if (hourlyRate < 1) {
      return res.status(400).json({ error: 'hourlyRate must be at least 1' });
    }

    // ── 1. Fetch live exchange rate ───────────────────────────────────
    let exchangeRate;
    try {
      const rateRes = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const rateData = await rateRes.json();
      exchangeRate = rateData.rates?.[currency];
      if (!exchangeRate) {
        throw new Error(`Rate for ${currency} not found`);
      }
    } catch (fetchErr) {
      return res.status(502).json({ error: `Currency rate unavailable: ${fetchErr.message}` });
    }

    // ── 2. Calculate totals ───────────────────────────────────────────
    const convertedTotal = hoursWorked * hourlyRate * exchangeRate;
    const gstAmount = gstEnabled ? convertedTotal * 0.18 : 0;
    const finalTotal = convertedTotal + gstAmount;

    // ── 3. Upsert client ──────────────────────────────────────────────
    const client = await prisma.client.upsert({
      where: { name: clientName },
      update: {},
      create: { name: clientName },
    });

    // ── 4. Create invoice record ──────────────────────────────────────
    const invoice = await prisma.invoice.create({
      data: {
        taskName,
        hoursWorked: parseFloat(hoursWorked),
        hourlyRate: parseFloat(hourlyRate),
        currency,
        exchangeRate,
        convertedTotal,
        gstAmount,
        gstEnabled: Boolean(gstEnabled),
        finalTotal,
        clientId: client.id,
      },
    });

    // ── 5. Generate PDF with Puppeteer ────────────────────────────────
    const invoiceDate = new Date(invoice.invoiceDate);
    const dateStr = invoiceDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const safeClientName = clientName.replace(/[^a-zA-Z0-9]/g, '_');
    const pdfFilename = `Invoice_${dateStr}_${safeClientName}.pdf`;
    const invoicesDir = path.resolve(__dirname, '..', 'invoices');
    const pdfFullPath = path.join(invoicesDir, pdfFilename);

    const html = generateInvoiceHTML({
      invoiceId: invoice.id,
      date: invoiceDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      clientName,
      taskName,
      hoursWorked,
      hourlyRate,
      currency,
      exchangeRate,
      convertedTotal,
      gstEnabled: Boolean(gstEnabled),
      gstAmount,
      finalTotal,
    });

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: pdfFullPath,
      format: 'A4',
      printBackground: true,
    });
    await browser.close();

    // ── 6. Update invoice with PDF path ───────────────────────────────
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoice.id },
      data: { pdfPath: pdfFullPath },
      include: { client: true },
    });

    // ── 7. Respond ────────────────────────────────────────────────────
    const pdfUrl = `/invoices/${pdfFilename}`;

    return res.status(201).json({
      success: true,
      invoice: {
        id: updatedInvoice.id,
        taskName: updatedInvoice.taskName,
        hoursWorked: updatedInvoice.hoursWorked,
        hourlyRate: updatedInvoice.hourlyRate,
        currency: updatedInvoice.currency,
        exchangeRate: updatedInvoice.exchangeRate,
        convertedTotal: updatedInvoice.convertedTotal,
        gstEnabled: updatedInvoice.gstEnabled,
        gstAmount: updatedInvoice.gstAmount,
        finalTotal: updatedInvoice.finalTotal,
        invoiceDate: updatedInvoice.invoiceDate,
        client: { name: updatedInvoice.client.name },
      },
      pdfUrl,
    });
  } catch (err) {
    console.error('POST /api/tasks error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

export default router;
