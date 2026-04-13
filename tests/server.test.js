const request = require('supertest');

jest.mock('../sheets', () => ({
  appendWaitlistEntry: jest.fn().mockResolvedValue(undefined),
}));

const app = require('../server');
const { appendWaitlistEntry } = require('../sheets');

describe('GET /', () => {
  test('serves the landing page with 200', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
  });
});

describe('POST /waitlist', () => {
  beforeEach(() => {
    appendWaitlistEntry.mockClear();
  });

  test('200 with valid email and zip', async () => {
    const res = await request(app)
      .post('/waitlist')
      .send({ email: 'test@example.com', zip: '10001' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(appendWaitlistEntry).toHaveBeenCalledWith('test@example.com', '10001');
  });

  test('400 for missing email', async () => {
    const res = await request(app).post('/waitlist').send({ zip: '10001' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email/i);
  });

  test('400 for invalid email format', async () => {
    const res = await request(app)
      .post('/waitlist')
      .send({ email: 'notanemail', zip: '10001' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email/i);
  });

  test('400 for missing zip', async () => {
    const res = await request(app)
      .post('/waitlist')
      .send({ email: 'test@example.com' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/zip/i);
  });

  test('400 for 4-digit zip', async () => {
    const res = await request(app)
      .post('/waitlist')
      .send({ email: 'test@example.com', zip: '1234' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/zip/i);
  });

  test('400 for alphabetic zip', async () => {
    const res = await request(app)
      .post('/waitlist')
      .send({ email: 'test@example.com', zip: 'abcde' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/zip/i);
  });

  test('500 when sheets throws', async () => {
    appendWaitlistEntry.mockRejectedValueOnce(new Error('API error'));
    const res = await request(app)
      .post('/waitlist')
      .send({ email: 'test@example.com', zip: '10001' });
    expect(res.status).toBe(500);
    expect(res.body.error).toBeTruthy();
  });
});
