jest.mock('googleapis', () => {
  const mockAppend = jest.fn().mockResolvedValue({});
  return {
    google: {
      auth: {
        GoogleAuth: jest.fn().mockImplementation(() => ({})),
      },
      sheets: jest.fn().mockReturnValue({
        spreadsheets: {
          values: {
            append: mockAppend,
          },
        },
      }),
      _mockAppend: mockAppend,
    },
  };
});

const { google } = require('googleapis');
const { appendWaitlistEntry } = require('../sheets');

beforeEach(() => {
  process.env.GOOGLE_SERVICE_ACCOUNT_JSON = JSON.stringify({
    type: 'service_account',
    client_email: 'test@proj.iam.gserviceaccount.com',
    private_key: 'fake-key',
  });
  process.env.GOOGLE_SHEET_ID = 'test-sheet-id-123';
  google._mockAppend.mockClear();
  google.sheets.mockClear();
  google.auth.GoogleAuth.mockClear();
});

test('initializes GoogleAuth with parsed credentials and sheets scope', async () => {
  await appendWaitlistEntry('test@example.com', '10001');
  expect(google.auth.GoogleAuth).toHaveBeenCalledWith(
    expect.objectContaining({
      credentials: expect.objectContaining({ type: 'service_account' }),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
  );
});

test('calls spreadsheets.values.append with correct spreadsheet ID and range', async () => {
  await appendWaitlistEntry('hello@example.com', '90210');
  expect(google._mockAppend).toHaveBeenCalledWith(
    expect.objectContaining({
      spreadsheetId: 'test-sheet-id-123',
      range: 'Sheet1!A:C',
      valueInputOption: 'RAW',
    })
  );
});

test('row values include email and zip as second and third columns', async () => {
  await appendWaitlistEntry('user@test.com', '33101');
  const call = google._mockAppend.mock.calls[0][0];
  const row = call.requestBody.values[0];
  expect(row[1]).toBe('user@test.com');
  expect(row[2]).toBe('33101');
});

test('first column is an ISO timestamp string', async () => {
  await appendWaitlistEntry('ts@example.com', '10001');
  const call = google._mockAppend.mock.calls[0][0];
  const timestamp = call.requestBody.values[0][0];
  expect(new Date(timestamp).toString()).not.toBe('Invalid Date');
});
