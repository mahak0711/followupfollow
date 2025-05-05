// tests/integration/api.test.js

import request from 'supertest';
import { app } from '../server'; // Assuming you have an Express app or Next.js API routes

describe('Lead API', () => {
  test('POST /api/leads should create a new lead', async () => {
    const response = await request(app)
      .post('/api/leads')
      .send({
        name: 'Test Lead',
        email: 'test@example.com',
        followUpDate: '2025-05-06T10:00:00Z',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Test Lead');
  });
});
