import { google } from 'googleapis';
import stream from 'stream';
import 'dotenv/config';

// ── AUTH ──────────────────────────────────────────────
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_PATH,
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive'
  ]
});

// ── 1. APPEND ROW TO GOOGLE SHEETS ───────────────────
export async function appendToSheet(invoiceData) {
  try {
    const sheets = google.sheets({ version: 'v4', auth });

    const row = [
      new Date().toISOString(),
      invoiceData.invoiceId,
      invoiceData.clientName,
      invoiceData.taskName,
      invoiceData.hours,
      invoiceData.rateUSD,
      invoiceData.currency,
      invoiceData.exchangeRate,
      invoiceData.subtotal,
      invoiceData.gstApplied ? 'Yes' : 'No',
      invoiceData.finalTotal
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1!A:K',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] }
    });

    console.log('✅ Row appended to Google Sheets');

  } catch (err) {
    console.error('❌ Sheets error:', err.message);
    // Don't crash the app — just log it
  }
}

// ── 2. FIND OR CREATE FOLDER IN DRIVE ────────────────
async function findOrCreateFolder(drive, folderName, parentId) {
  // Search for existing folder with this name inside parent
  const res = await drive.files.list({
    q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`,
    fields: 'files(id, name)'
  });

  if (res.data.files.length > 0) {
    return res.data.files[0].id; // already exists
  }

  // Create it fresh
  const folder = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId]
    },
    fields: 'id'
  });

  return folder.data.id;
}

// ── 3. UPLOAD PDF TO GOOGLE DRIVE ────────────────────
export async function saveToDrive(pdfBuffer, clientName) {
  try {
    const drive = google.drive({ version: 'v3', auth });

    // Auto-create client subfolder inside master folder
    const clientFolderId = await findOrCreateFolder(
      drive,
      clientName,                                      // subfolder name = client name
      process.env.GOOGLE_DRIVE_MASTER_FOLDER_ID        // inside master folder
    );

    // Build filename: Invoice_2026-04-29_AcmeCorp.pdf
    const today = new Date().toISOString().split('T')[0];
    const safeName = clientName.replace(/\s+/g, '');   // remove spaces
    const fileName = `Invoice_${today}_${safeName}.pdf`;

    // Convert buffer to readable stream for upload
    const bufferStream = new stream.PassThrough();
    bufferStream.end(pdfBuffer);

    // Upload the PDF
    await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: 'application/pdf',
        parents: [clientFolderId]
      },
      media: {
        mimeType: 'application/pdf',
        body: bufferStream
      }
    });

    console.log(`✅ PDF saved to Drive: ${fileName}`);

  } catch (err) {
    console.error('❌ Drive error:', err.message);
    // Don't crash the app — just log it
  }
}
