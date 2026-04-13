const { google } = require('googleapis');

async function appendWaitlistEntry(email, zip) {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Sheet1!A:C',
    valueInputOption: 'RAW',
    requestBody: {
      values: [[new Date().toISOString(), email, zip]],
    },
  });
}

module.exports = { appendWaitlistEntry };
