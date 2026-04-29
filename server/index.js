/*
  CONCEPT Q: If 1000 invoices must be generated but a 6-minute execution
  limit blocks the script, how would you redesign the system?

  ANSWER: Use a queue-based architecture. Push each invoice job into a
  queue (BullMQ + Redis). A worker picks up jobs one at a time. Use
  node-cron to trigger batches of ~50 every few minutes. Track each
  invoice's status in the DB as "pending" | "processing" | "done" | "failed".
  Failed jobs get retried automatically. No single execution ever times out.
*/

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import tasksRouter from './routes/tasks.js';
import invoicesRouter from './routes/invoices.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Auto-create invoices directory ─────────────────────────────────────
const invoicesDir = path.join(__dirname, 'invoices');
fs.mkdirSync(invoicesDir, { recursive: true });

// ── Serve static PDF files ─────────────────────────────────────────────
app.use('/invoices', express.static(invoicesDir));

// ── API Routes ─────────────────────────────────────────────────────────
app.use('/api/tasks', tasksRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api', invoicesRouter); // Mount /api/clients here too

// ── Health check ───────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Start server ───────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Invoices directory: ${invoicesDir}`);
});
