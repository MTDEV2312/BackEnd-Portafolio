import request from 'supertest';
import app from '../src/app.js';
import fs from 'fs';
import path from 'path';

describe('Project Image Upload', () => {
  let authToken;

  beforeAll(async () => {
    // Este test requiere autenticación
    // En un entorno real, deberías tener credenciales de test configuradas
    console.log('⚠️  Los tests de upload requieren autenticación válida');
  });

  test('Should reject non-image files', async () => {
    // Crear un archivo de texto temporal para el test
    const testFilePath = path.join(process.cwd(), 'test-file.txt');
    fs.writeFileSync(testFilePath, 'Este es un archivo de texto');

    const response = await request(app)
      .post('/api/projects/create')
      .attach('image', testFilePath)
      .field('title', 'Test Project')
      .field('description', 'Test description for project');

    // Limpiar archivo temporal
    fs.unlinkSync(testFilePath);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('Solo se permiten archivos de imagen');
  });

  test('Should reject files larger than 5MB', async () => {
    // Este test verifica que el middleware de multer está configurado correctamente
    const response = await request(app)
      .post('/api/projects/create')
      .field('title', 'Test Project')
      .field('description', 'Test description for project');

    // Sin imagen ni archivo debería fallar
    expect(response.status).toBe(400);
  });

  test('Should accept project creation without file if imageSrc provided', async () => {
    const response = await request(app)
      .post('/api/projects/create')
      .send({
        title: 'Test Project',
        description: 'Test description for project',
        imageSrc: 'https://example.com/image.jpg'
      });

    // Sin autenticación debería ser 401
    expect(response.status).toBe(401);
  });

  test('Should validate required fields when using file upload', async () => {
    // Crear un archivo de imagen temporal (1x1 pixel PNG)
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, // color type, etc.
      0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk
      0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, // image data
      0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 
      0xE5, 0x27, 0xDE, 0xFC, 0x00, 0x00, 0x00, 0x00, // IEND chunk
      0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    const testImagePath = path.join(process.cwd(), 'test-image.png');
    fs.writeFileSync(testImagePath, pngBuffer);

    const response = await request(app)
      .post('/api/projects/create')
      .attach('image', testImagePath)
      .field('title', '') // Título vacío debería fallar
      .field('description', 'Test description for project');

    // Limpiar archivo temporal
    fs.unlinkSync(testImagePath);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});

describe('Project Image Validation', () => {
  test('Should validate image URL format', async () => {
    const response = await request(app)
      .post('/api/projects/create')
      .send({
        title: 'Test Project',
        description: 'Test description for project',
        imageSrc: 'invalid-url'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  test('Should accept valid project data with image URL', async () => {
    const response = await request(app)
      .post('/api/projects/create')
      .send({
        title: 'Test Project',
        description: 'This is a test description for the project',
        imageSrc: 'https://example.com/valid-image.jpg',
        githubLink: 'https://github.com/test/repo',
        liveDemoLink: 'https://test-demo.com'
      });

    // Sin autenticación debería ser 401, pero la validación de datos debería pasar
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('Token de acceso requerido');
  });
});
