import request from 'supertest';
import app from '../app.js';

const checkUrl = async (url) => {
  if (!url || typeof url !== 'string') {
    return { ok: false, status: null, contentType: null, error: 'URL vacia o invalida' };
  }

  try {
    let response = await fetch(url, { method: 'HEAD' });

    if (response.status === 405 || response.status === 501) {
      response = await fetch(url, { method: 'GET' });
    }

    const contentType = response.headers.get('content-type');
    const ok = response.ok && typeof contentType === 'string' && contentType.toLowerCase().includes('image');

    return {
      ok,
      status: response.status,
      contentType,
      error: ok ? null : 'Respuesta no valida para imagen'
    };
  } catch (error) {
    return {
      ok: false,
      status: null,
      contentType: null,
      error: error.message
    };
  }
};

const buildEntries = (project) => {
  const variants = project?.imageVariants || {};

  return [
    { projectId: project?.id, source: 'imageSrc', url: project?.imageSrc },
    { projectId: project?.id, source: 'tinyPreviewUrl', url: project?.tinyPreviewUrl },
    { projectId: project?.id, source: 'variant.hero', url: variants?.hero || null },
    { projectId: project?.id, source: 'variant.cardLg', url: variants?.cardLg || null },
    { projectId: project?.id, source: 'variant.cardMd', url: variants?.cardMd || null },
    { projectId: project?.id, source: 'variant.preview', url: variants?.preview || null }
  ].filter((entry) => Boolean(entry.url));
};

const run = async () => {
  const projectsResponse = await request(app).get('/api/projects/read');

  if (projectsResponse.status !== 200) {
    console.error(JSON.stringify({
      ok: false,
      message: 'No se pudieron leer proyectos',
      status: projectsResponse.status,
      body: projectsResponse.body
    }, null, 2));
    process.exit(1);
  }

  const projects = Array.isArray(projectsResponse.body?.data) ? projectsResponse.body.data : [];
  const entries = projects.flatMap(buildEntries);

  const results = [];
  for (const entry of entries) {
    const checked = await checkUrl(entry.url);
    results.push({ ...entry, ...checked });
  }

  const total = results.length;
  const success = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);

  const summary = {
    ok: failed.length === 0,
    projectsChecked: projects.length,
    imageUrlsChecked: total,
    success,
    failed: failed.length,
    failedSamples: failed.slice(0, 10)
  };

  console.log(JSON.stringify(summary, null, 2));

  if (failed.length > 0) {
    process.exit(1);
  }
};

run().catch((error) => {
  console.error(JSON.stringify({ ok: false, message: error.message }, null, 2));
  process.exit(1);
});
