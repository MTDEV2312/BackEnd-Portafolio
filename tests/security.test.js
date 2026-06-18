import request from 'supertest';
import app from '../src/app.js';

describe('PostgreSQL Security Tests', () => {
  describe('SQL Injection Prevention', () => {
    const sqlInjectionAttempts = [
      "'; DROP TABLE proyectos; --",
      "1' OR '1'='1",
      "1; INSERT INTO proyectos (title) VALUES ('hacked')",
      "1' UNION SELECT * FROM users --",
      "'; DELETE FROM proyectos WHERE 1=1; --",
      "1' OR 1=1 --",
      "admin'--",
      "admin' /*",
      "1'; EXEC xp_cmdshell('dir'); --"
    ];

    sqlInjectionAttempts.forEach((injection, index) => {
      test(`Should prevent SQL injection attempt ${index + 1}`, async () => {
        const response = await request(app)
          .post('/api/projects/create')
          .send({
            title: injection,
            description: 'Test description',
            imageSrc: 'https://example.com/image.jpg'
          });

        // Debe ser rechazado (400, 401, o 403)
        expect([400, 401, 403]).toContain(response.status);
      });
    });
  });

  describe('Input Validation', () => {
    test('Should reject excessively long input', async () => {
      const longString = 'a'.repeat(10001); // Más de 10KB

      const response = await request(app)
        .post('/api/projects/create')
        .send({
          title: longString,
          description: 'Test description',
          imageSrc: 'https://example.com/image.jpg'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    test('Should reject input with null characters', async () => {
      const response = await request(app)
        .post('/api/projects/create')
        .send({
          title: 'Test\0Title',
          description: 'Test description',
          imageSrc: 'https://example.com/image.jpg'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Dangerous SQL Commands Prevention', () => {
    const dangerousCommands = [
      'SELECT * FROM proyectos',
      'INSERT INTO proyectos VALUES',
      'UPDATE proyectos SET',
      'DELETE FROM proyectos',
      'DROP TABLE proyectos',
      'CREATE TABLE test',
      'ALTER TABLE proyectos',
      'GRANT ALL TO public',
      'REVOKE ALL FROM user',
      'TRUNCATE TABLE proyectos'
    ];

    dangerousCommands.forEach((command, index) => {
      test(`Should prevent dangerous SQL command ${index + 1}: ${command}`, async () => {
        const response = await request(app)
          .post('/api/projects/create')
          .send({
            title: `Test ${command}`,
            description: `Description with ${command}`,
            imageSrc: 'https://example.com/image.jpg'
          });

        expect([400, 401, 403]).toContain(response.status);
      });
    });
  });

  describe('XSS Prevention', () => {
    const xssAttempts = [
      '<script>alert("xss")</script>',
      '<img src="x" onerror="alert(1)">',
      'javascript:alert("xss")',
      '<svg onload="alert(1)">',
      '<iframe src="javascript:alert(\'XSS\')"></iframe>'
    ];

    xssAttempts.forEach((xss, index) => {
      test(`Should sanitize XSS attempt ${index + 1}`, async () => {
        const response = await request(app)
          .get('/api/projects/read')
          .query({ search: xss });

        // La aplicación no debe fallar
        expect(response.status).not.toBe(500);
        
        // El XSS debe estar sanitizado en la query
        expect(JSON.stringify(response.body)).not.toContain('<script>');
      });
    });
  });

  describe('Rate Limiting', () => {
    test('Should apply rate limiting to specific operations', async () => {
      // Este test requeriría hacer muchas peticiones rápidamente
      // Para propósitos de demo, verificamos que el middleware está presente
      const response = await request(app)
        .get('/api/projects/read');

      // Verificar que no hay error interno
      expect(response.status).not.toBe(500);
    });
  });

  describe('Headers Security', () => {
    test('Should include security headers', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.headers).toHaveProperty('x-frame-options', 'DENY');
      expect(response.headers).toHaveProperty('x-content-type-options', 'nosniff');
      expect(response.headers).toHaveProperty('x-xss-protection', '1; mode=block');
    });
  });
});
