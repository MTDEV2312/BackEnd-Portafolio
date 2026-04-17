import request from 'supertest';
import app from '../app.js';

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const hasRenderImageUrl = (value) => typeof value === 'string' && value.includes('/render/image/');

const main = async () => {
  const checks = [];

  const health = await request(app).get('/health');
  checks.push({ name: 'GET /health', status: health.status, ok: health.status === 200 });

  const projects = await request(app).get('/api/projects/read');
  checks.push({ name: 'GET /api/projects/read', status: projects.status, ok: projects.status === 200 });

  const profiles = await request(app).get('/api/profiles/read');
  checks.push({ name: 'GET /api/profiles/read', status: profiles.status, ok: profiles.status === 200 });

  const projectData = Array.isArray(projects.body?.data) ? projects.body.data : [];

  const hasArrayTech = projectData.every((p) => Array.isArray(p?.techSection));
  const hasMetaFields = projectData.every((p) => (
    'imageWidth' in p &&
    'imageHeight' in p &&
    'imageAspectRatio' in p &&
    'imageMimeType' in p &&
    'storagePath' in p &&
    'tinyPreviewUrl' in p
  ));

  const hasRenderInTiny = projectData.some((p) => hasRenderImageUrl(p?.tinyPreviewUrl));
  const hasRenderInVariants = projectData.some((p) => {
    const variants = p?.imageVariants || {};
    return Object.values(variants).some((v) => hasRenderImageUrl(v));
  });

  const responseSummary = {
    endpointChecks: checks,
    projectsCount: projectData.length,
    contract: {
      hasArrayTech,
      hasMetaFields,
      hasRenderInTiny,
      hasRenderInVariants
    },
    headers: {
      projects: {
        cacheControl: projects.headers['cache-control'] || null,
        lastModified: projects.headers['last-modified'] || null
      },
      profiles: {
        cacheControl: profiles.headers['cache-control'] || null,
        lastModified: profiles.headers['last-modified'] || null
      }
    }
  };

  console.log(JSON.stringify(responseSummary, null, 2));

  assert(checks.every((c) => c.ok), 'Uno o mas endpoints publicos fallaron');
  assert(hasArrayTech, 'techSection no esta normalizado como array en todos los proyectos');
  assert(hasMetaFields, 'Faltan campos de metadata en uno o mas proyectos');
  assert(!hasRenderInTiny, 'Se detectaron tinyPreviewUrl con /render/image en modo fallback');
  assert(!hasRenderInVariants, 'Se detectaron imageVariants con /render/image en modo fallback');

  console.log('\nVALIDACION OK: optimizacion backend funcionando correctamente para plan gratis.');
};

main().catch((error) => {
  console.error('\nVALIDACION FALLIDA:', error.message);
  process.exit(1);
});
