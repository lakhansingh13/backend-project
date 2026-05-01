const request = require('supertest');
const app = require('../index'); // your express app

describe('GET /api/test', () => {

  it('should return 200 OK', async () => {
    const res = await request(app).get('/api/test');

    expect(res.statusCode).toEqual(200);
  });

  it('should return 429 if rate limit exceeded', async () => {
    for (let i = 0; i < 110; i++) {
      await request(app).get('/api/test');
    }

    const res = await request(app).get('/api/test');

    expect(res.statusCode).toEqual(429);
  });

});