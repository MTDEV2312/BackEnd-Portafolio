import request from 'supertest';
import app from '../src/app.js';

describe('API Health Check', () => {
  test('GET / should return API info', async () => {
    const response = await request(app)
      .get('/')
      .expect(200);

    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('version');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('endpoints');
  });

  test('GET /health should return health status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
    expect(response.body).toHaveProperty('environment');
  });

  test('GET /nonexistent should return 404', async () => {
    const response = await request(app)
      .get('/nonexistent')
      .expect(404);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error');
  });
});

describe('Security Headers', () => {
  test('Should include security headers', async () => {
    const response = await request(app)
      .get('/')
      .expect(200);

    expect(response.headers).toHaveProperty('x-frame-options');
    expect(response.headers).toHaveProperty('x-content-type-options');
    expect(response.headers).toHaveProperty('x-xss-protection');
  });
});

describe('CORS', () => {
  test('OPTIONS /api/users/login should include CORS headers for allowed origin', async () => {
    const response = await request(app)
      .options('/api/users/login')
      .set('Origin', 'https://www.mathiast.me')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type')
      .expect(204);

    expect(response.headers['access-control-allow-origin']).toBe('https://www.mathiast.me');
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });

  test('Preflight should still work after rate limit threshold', async () => {
    for (let i = 0; i < 100; i += 1) {
      await request(app).get('/');
    }

    const response = await request(app)
      .options('/api/users/login')
      .set('Origin', 'https://www.mathiast.me')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type')
      .expect(204);

    expect(response.headers['access-control-allow-origin']).toBe('https://www.mathiast.me');
  });
});
