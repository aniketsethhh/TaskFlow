# TaskFlow — Task-to-Invoice Portal

A full-stack freelancer portal that lets you log tasks, automatically convert currencies with live exchange rates, and generate professional PDF invoices. Built with React + Vite on the frontend and Express + Prisma + PostgreSQL on the backend.

---

## Prerequisites

- **Node.js 18+**
- **PostgreSQL** database (or a hosted service like [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app))
- A modern browser

## Quick Start

```bash
# 1. Clone the repo
git clone <repo-url>
cd task-to-invoice-portal

# 2. Install all dependencies (root, server, client)
npm run install:all

# 3. Configure environment variables
#    → Edit /server/.env with your DATABASE_URL
#    → Edit /client/.env if your API runs on a different port

# 4. Run Prisma migrations
cd server
npx prisma migrate dev --name init
npx prisma generate
cd ..

# 5. Start both servers
npm run dev
```

- **Frontend** → http://localhost:5173
- **Backend** → http://localhost:5000

---

## API Endpoints

| Method | Endpoint                  | Description                              |
|--------|---------------------------|------------------------------------------|
| POST   | `/api/tasks`              | Create a task → generates invoice + PDF  |
| GET    | `/api/invoices`           | List all invoices (sorted by date desc)  |
| GET    | `/api/invoices/:id/pdf`   | Download a specific invoice's PDF        |
| GET    | `/api/clients`            | List all clients with invoice counts     |
| GET    | `/api/health`             | Health check                             |

### POST `/api/tasks` — Request Body

```json
{
  "taskName": "Landing page redesign",
  "clientName": "Acme Corp",
  "hoursWorked": 10,
  "hourlyRate": 50,
  "currency": "INR",
  "gstEnabled": true
}
```

---

## How the Currency API Works

We use the free [ExchangeRate-API](https://api.exchangerate-api.com/v4/latest/USD) endpoint (no API key required). On every invoice creation:

1. The server fetches the latest USD-based exchange rates
2. The selected currency rate is extracted from the response
3. The base total is calculated: `hoursWorked × hourlyRate × exchangeRate`
4. If the rate is unavailable, the request fails with a `502` error

On the frontend, exchange rates are fetched once per currency selection and cached in component state to avoid redundant API calls.

---

## How PDF Generation Works

1. After an invoice record is created in the database, we launch a headless **Puppeteer** browser
2. A professional HTML template (inline CSS, indigo color scheme) is rendered via `page.setContent()`
3. The page is exported to an A4 PDF with `page.pdf()` and saved to `/server/invoices/`
4. The invoice record is updated with the PDF file path
5. PDFs are served statically and can be downloaded from the invoice list

---

## GST Feature

- Toggle the **"Apply 18% GST"** checkbox on the task form
- When enabled, GST is calculated as **18% of the converted total**
- The GST amount is shown in the live preview, the success card, invoice cards, and the PDF
- GST breakdown: `gstAmount = convertedTotal × 0.18`, `finalTotal = convertedTotal + gstAmount`

---

## Concept Q&A: Scaling to 1000 Invoices

> **Q:** If 1000 invoices must be generated but a 6-minute execution limit blocks the script, how would you redesign the system?

**A:** Use a **queue-based architecture**:

1. Push each invoice job into a message queue (e.g., **BullMQ + Redis**)
2. A dedicated worker process picks up jobs one at a time
3. Use **node-cron** to trigger batches of ~50 invoices every few minutes
4. Track each invoice's status in the DB as `"pending" | "processing" | "done" | "failed"`
5. Failed jobs are automatically retried with exponential backoff
6. No single execution ever exceeds the timeout — the work is distributed across multiple small runs

---

## Project Structure

```
├── client/                  # React + Vite + TailwindCSS frontend
│   ├── src/
│   │   ├── components/      # Navbar, SuccessCard
│   │   ├── pages/           # TaskForm, InvoiceList
│   │   ├── main.jsx         # React Router setup
│   │   └── index.css        # TailwindCSS entry
│   └── .env                 # VITE_API_URL
├── server/                  # Express backend
│   ├── prisma/
│   │   └── schema.prisma    # Database models
│   ├── routes/
│   │   ├── tasks.js         # POST /api/tasks
│   │   └── invoices.js      # GET /api/invoices, clients
│   ├── lib/
│   │   ├── prisma.js        # Prisma singleton
│   │   └── invoiceTemplate.js # PDF HTML generator
│   ├── invoices/            # Auto-created PDF storage
│   ├── index.js             # Express entry point
│   └── .env                 # DATABASE_URL, PORT
├── package.json             # Root scripts (dev, install:all)
└── README.md
```

---

## License

MIT
