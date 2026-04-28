import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { imageSize } from 'image-size';
import { pathToFileURL } from 'url';

dotenv.config();

const IMAGE_BUCKET = 'Images';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const SUPABASE_IMAGE_TRANSFORM_ENABLED = String(process.env.SUPABASE_IMAGE_TRANSFORM_ENABLED || 'false').toLowerCase() === 'true';
const TABLE_NAME = 'proyectos';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY (o SUPABASE_ANON_KEY) en .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

const extractStoragePathFromUrl = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') return null;

  const marker = `/storage/v1/object/public/${IMAGE_BUCKET}/`;
  const markerIndex = imageUrl.indexOf(marker);
  if (markerIndex === -1) return null;

  const rawPath = imageUrl.slice(markerIndex + marker.length);
  return rawPath ? rawPath.split('?')[0] : null;
};

const safeAspectRatio = (width, height) => {
  if (!width || !height) return null;
  return Number((width / height).toFixed(4));
};

const buildTinyPreviewUrlFromPath = (storagePath) => {
  if (!storagePath || !SUPABASE_URL) return null;

  if (!SUPABASE_IMAGE_TRANSFORM_ENABLED) {
    return `${SUPABASE_URL}/storage/v1/object/public/${IMAGE_BUCKET}/${storagePath}`;
  }

  return `${SUPABASE_URL}/storage/v1/render/image/public/${IMAGE_BUCKET}/${storagePath}?width=48&quality=55`;
};

const isTransformUrl = (url) => typeof url === 'string' && url.includes('/storage/v1/render/image/');

const readImageMetadata = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return { error: `HTTP ${response.status}` };
    }

    const mimeType = response.headers.get('content-type') || null;
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const dimensions = imageSize(buffer);

    return {
      width: dimensions?.width ?? null,
      height: dimensions?.height ?? null,
      mimeType,
      error: null
    };
  } catch (error) {
    return { error: error.message };
  }
};

const buildUpdatePayload = async (project) => {
  const payload = {};

  if (!project.storage_path) {
    const derivedPath = extractStoragePathFromUrl(project.image_src);
    if (derivedPath) payload.storage_path = derivedPath;
  }

  const nextStoragePath = payload.storage_path || project.storage_path;
  const shouldReplaceTinyPreview =
    (!project.tiny_preview_url && nextStoragePath) ||
    (!SUPABASE_IMAGE_TRANSFORM_ENABLED && isTransformUrl(project.tiny_preview_url));

  if (shouldReplaceTinyPreview && nextStoragePath) {
    payload.tiny_preview_url = buildTinyPreviewUrlFromPath(nextStoragePath);
  }

  const needsImageProbe = !project.image_width || !project.image_height || !project.image_mime_type;
  if (needsImageProbe && project.image_src) {
    const metadata = await readImageMetadata(project.image_src);

    if (!metadata.error) {
      if (!project.image_width && metadata.width) payload.image_width = metadata.width;
      if (!project.image_height && metadata.height) payload.image_height = metadata.height;
      if (!project.image_mime_type && metadata.mimeType) payload.image_mime_type = metadata.mimeType;

      const nextWidth = payload.image_width || project.image_width;
      const nextHeight = payload.image_height || project.image_height;
      if (!project.image_aspect_ratio && nextWidth && nextHeight) {
        payload.image_aspect_ratio = safeAspectRatio(nextWidth, nextHeight);
      }
    } else {
      payload.__probeError = metadata.error;
    }
  }

  if (!project.image_alt && project.title) {
    payload.image_alt = project.title;
  }

  return payload;
};

export const runImageMetadataBackfill = async (options = {}) => {
  const {
    verbose = true,
    maxRows = null,
    onlyMissing = true
  } = options;

  if (verbose) {
    console.log('Iniciando backfill de metadata de imagen...');
  }

  let query = supabase
    .from(TABLE_NAME)
    .select('id,title,image_src,storage_path,tiny_preview_url,image_width,image_height,image_aspect_ratio,image_mime_type,image_alt')
    .order('id', { ascending: true, nullsFirst: false });

  if (onlyMissing) {
    const missingFilters = [
      'storage_path.is.null',
      'tiny_preview_url.is.null',
      'image_width.is.null',
      'image_height.is.null',
      'image_aspect_ratio.is.null',
      'image_mime_type.is.null',
      'image_alt.is.null'
    ];

    if (!SUPABASE_IMAGE_TRANSFORM_ENABLED) {
      missingFilters.push('tiny_preview_url.ilike.*render/image*');
    }

    query = query.or(missingFilters.join(','));
  }

  if (Number.isInteger(maxRows) && maxRows > 0) {
    query = query.limit(maxRows);
  }

  const { data: projects, error } = await query;

  if (error) {
    throw new Error(`Error leyendo proyectos: ${error.message}`);
  }

  let scanned = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const project of projects || []) {
    scanned += 1;

    const payload = await buildUpdatePayload(project);
    const probeError = payload.__probeError;
    delete payload.__probeError;

    const updateKeys = Object.keys(payload);
    if (updateKeys.length === 0) {
      skipped += 1;
      continue;
    }

    const { error: updateError } = await supabase
      .from(TABLE_NAME)
      .update(payload)
      .eq('id', project.id);

    if (updateError) {
      failed += 1;
      if (verbose) {
        console.error(`Error actualizando ${project.id}:`, updateError.message);
      }
      continue;
    }

    updated += 1;
    const errorSuffix = probeError ? ` (probe warning: ${probeError})` : '';
    if (verbose) {
      console.log(`Actualizado ${project.id}: ${updateKeys.join(', ')}${errorSuffix}`);
    }
  }

  const summary = {
    scanned,
    updated,
    skipped,
    failed
  };

  if (verbose) {
    console.log('\nResumen backfill:');
    console.log(`- Revisados: ${summary.scanned}`);
    console.log(`- Actualizados: ${summary.updated}`);
    console.log(`- Sin cambios: ${summary.skipped}`);
    console.log(`- Fallidos: ${summary.failed}`);
  }

  return summary;
};

const runCli = async () => {
  try {
    const summary = await runImageMetadataBackfill({ verbose: true, onlyMissing: true });

    if (summary.failed > 0) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

const isDirectExecution = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false;

if (isDirectExecution) {
  runCli();
}
