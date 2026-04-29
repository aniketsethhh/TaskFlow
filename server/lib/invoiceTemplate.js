/**
 * Generate a professional invoice HTML string for PDF rendering.
 *
 * @param {Object} data
 * @param {number} data.invoiceId
 * @param {string} data.date
 * @param {string} data.clientName
 * @param {string} data.taskName
 * @param {number} data.hoursWorked
 * @param {number} data.hourlyRate
 * @param {string} data.currency
 * @param {number} data.exchangeRate
 * @param {number} data.convertedTotal
 * @param {boolean} data.gstEnabled
 * @param {number} data.gstAmount
 * @param {number} data.finalTotal
 * @returns {string} Full HTML document string
 */
export function generateInvoiceHTML({
  invoiceId,
  date,
  clientName,
  taskName,
  hoursWorked,
  hourlyRate,
  currency,
  exchangeRate,
  convertedTotal,
  gstEnabled,
  gstAmount,
  finalTotal,
}) {
  const fmt = (n) => Number(n).toFixed(2);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice #${invoiceId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #1e293b;
      background: #ffffff;
      padding: 0;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 0;
    }
    .header {
      background: linear-gradient(135deg, #4F46E5 0%, #6366F1 50%, #818CF8 100%);
      color: #ffffff;
      padding: 40px 48px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header h1 {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .header .tagline {
      font-size: 14px;
      opacity: 0.85;
      margin-top: 4px;
      font-weight: 400;
    }
    .header .invoice-badge {
      background: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 8px;
      padding: 12px 20px;
      text-align: right;
    }
    .header .invoice-badge .label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      opacity: 0.8;
    }
    .header .invoice-badge .value {
      font-size: 20px;
      font-weight: 700;
    }
    .info-section {
      display: flex;
      justify-content: space-between;
      padding: 32px 48px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }
    .info-block h3 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #64748b;
      margin-bottom: 6px;
    }
    .info-block p {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }
    .table-section {
      padding: 32px 48px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
    }
    thead th {
      background: #4F46E5;
      color: #ffffff;
      padding: 14px 16px;
      text-align: left;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      font-weight: 600;
    }
    thead th:first-child { border-radius: 8px 0 0 0; }
    thead th:last-child { border-radius: 0 8px 0 0; }
    tbody td {
      padding: 14px 16px;
      font-size: 14px;
      border-bottom: 1px solid #e2e8f0;
    }
    tbody tr:hover { background: #f8fafc; }
    .totals-section {
      padding: 0 48px 32px 48px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 20px;
      font-size: 15px;
      border-bottom: 1px solid #e2e8f0;
    }
    .total-row.subtotal {
      color: #475569;
    }
    .total-row.gst {
      color: #d97706;
      background: #fffbeb;
      border-radius: 6px;
      border: 1px solid #fde68a;
      margin-top: 8px;
    }
    .total-row.final {
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
      color: #ffffff;
      font-size: 18px;
      font-weight: 700;
      border-radius: 8px;
      margin-top: 12px;
      border: none;
      padding: 18px 24px;
    }
    .footer {
      text-align: center;
      padding: 32px 48px;
      color: #94a3b8;
      font-size: 13px;
      border-top: 1px solid #e2e8f0;
      margin-top: 24px;
    }
    .footer span {
      color: #4F46E5;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div>
        <h1>FreelanceFlow</h1>
        <div class="tagline">Professional Invoice</div>
      </div>
      <div class="invoice-badge">
        <div class="label">Invoice</div>
        <div class="value">#${String(invoiceId).padStart(5, '0')}</div>
      </div>
    </div>

    <div class="info-section">
      <div class="info-block">
        <h3>Invoice Date</h3>
        <p>${date}</p>
      </div>
      <div class="info-block">
        <h3>Billed To</h3>
        <p>${clientName}</p>
      </div>
    </div>

    <div class="table-section">
      <table>
        <thead>
          <tr>
            <th>Task</th>
            <th>Hours</th>
            <th>Rate (USD)</th>
            <th>Exchange Rate</th>
            <th>Base Total (${currency})</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${taskName}</td>
            <td>${fmt(hoursWorked)}</td>
            <td>$${fmt(hourlyRate)}</td>
            <td>${fmt(exchangeRate)}</td>
            <td>${currency} ${fmt(convertedTotal)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="totals-section">
      <div class="total-row subtotal">
        <span>Subtotal</span>
        <span>${currency} ${fmt(convertedTotal)}</span>
      </div>
      ${
        gstEnabled
          ? `<div class="total-row gst">
              <span>GST (18%)</span>
              <span>${currency} ${fmt(gstAmount)}</span>
            </div>`
          : ''
      }
      <div class="total-row final">
        <span>Final Total</span>
        <span>${currency} ${fmt(finalTotal)}</span>
      </div>
    </div>

    <div class="footer">
      Thank you for your business &bull; <span>FreelanceFlow</span> Invoice Portal
    </div>
  </div>
</body>
</html>`;
}
