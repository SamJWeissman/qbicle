const request = require('supertest');

jest.mock('../sheets', () => ({
  appendWaitlistEntry: jest.fn().mockResolvedValue(undefined),
}));

const app = require('../server');

describe('GET /', () => {
  test('serves the landing page with 200', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
  });
});
