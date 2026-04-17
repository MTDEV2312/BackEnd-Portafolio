import supabase from '../config/config.js';

const IMAGE_BUCKET = 'Images';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_IMAGE_TRANSFORM_ENABLED = String(process.env.SUPABASE_IMAGE_TRANSFORM_ENABLED || 'false').toLowerCase() === 'true';

const PROJECT_BASE_COLUMNS = [
    'id',
    'title',
    'description',
    'image_src',
    'github_link',
    'live_demo_link',
    'techSection'
];

const PROJECT_OPTIONAL_COLUMNS = [
    'updated_at',
    'created_at',
    'image_width',
    'image_height',
    'image_aspect_ratio',
    'image_mime_type',
    'image_alt',
    'storage_path',
    'blur_hash',
    'dominant_color',
    'tiny_preview_url'
];

const PROJECT_READ_COLUMNS = [...PROJECT_BASE_COLUMNS, ...PROJECT_OPTIONAL_COLUMNS].join(',');

const isMissingColumnError = (error) => {
    if (!error) return false;

    return error.code === 'PGRST204' ||
        (typeof error.message === 'string' && error.message.toLowerCase().includes('column'));
};

const extractStoragePathFromUrl = (imageUrl) => {
    if (!imageUrl || typeof imageUrl !== 'string') return null;

    const marker = `/storage/v1/object/public/${IMAGE_BUCKET}/`;
    const markerIndex = imageUrl.indexOf(marker);
    if (markerIndex === -1) return null;

    const rawPath = imageUrl.slice(markerIndex + marker.length);
    if (!rawPath) return null;

    return rawPath.split('?')[0] || null;
};

const buildPublicImageUrl = (storagePath, fallbackUrl) => {
    if (storagePath && SUPABASE_URL) {
        return `${SUPABASE_URL}/storage/v1/object/public/${IMAGE_BUCKET}/${storagePath}`;
    }

    return fallbackUrl || null;
};

const buildImageVariants = (publicUrl) => {
    if (!publicUrl || !SUPABASE_URL) return null;

    if (!SUPABASE_IMAGE_TRANSFORM_ENABLED) {
        return {
            hero: publicUrl,
            cardLg: publicUrl,
            cardMd: publicUrl,
            preview: publicUrl
        };
    }

    const storagePath = extractStoragePathFromUrl(publicUrl);
    if (!storagePath) return null;

    const baseTransformUrl = `${SUPABASE_URL}/storage/v1/render/image/public/${IMAGE_BUCKET}/${storagePath}`;

    return {
        hero: `${baseTransformUrl}?width=1600&quality=80`,
        cardLg: `${baseTransformUrl}?width=960&quality=78`,
        cardMd: `${baseTransformUrl}?width=640&quality=76`,
        preview: `${baseTransformUrl}?width=320&quality=70`
    };
};

const buildTinyPreviewUrlFromPath = (storagePath) => {
    if (!storagePath || !SUPABASE_URL) return null;

    if (!SUPABASE_IMAGE_TRANSFORM_ENABLED) {
        return `${SUPABASE_URL}/storage/v1/object/public/${IMAGE_BUCKET}/${storagePath}`;
    }

    return `${SUPABASE_URL}/storage/v1/render/image/public/${IMAGE_BUCKET}/${storagePath}?width=48&quality=55`;
};

const isTransformUrl = (url) => typeof url === 'string' && url.includes('/storage/v1/render/image/');

const normalizeTechSection = (value) => {
    if (Array.isArray(value)) {
        return value.filter(Boolean);
    }

    if (typeof value !== 'string' || !value.trim()) {
        return [];
    }

    try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
            return parsed.filter(Boolean);
        }
    } catch (error) {
        // no-op: fallback to comma-separated parsing
    }

    return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
};

const sanitizeProjectReadModel = (project) => {
    const storagePath = project.storage_path || extractStoragePathFromUrl(project.image_src);
    const stableImageUrl = buildPublicImageUrl(storagePath, project.image_src);
    const imageVariants = buildImageVariants(stableImageUrl);
    const persistedTinyPreview = (!SUPABASE_IMAGE_TRANSFORM_ENABLED && isTransformUrl(project.tiny_preview_url))
        ? null
        : project.tiny_preview_url;
    const tinyPreviewUrl = persistedTinyPreview ?? buildTinyPreviewUrlFromPath(storagePath) ?? imageVariants?.preview ?? stableImageUrl ?? null;

    return {
        id: project.id,
        title: project.title,
        description: project.description,
        imageSrc: stableImageUrl,
        githubLink: project.github_link,
        liveDemoLink: project.live_demo_link,
        techSection: normalizeTechSection(project.techSection),
        imageWidth: project.image_width ?? null,
        imageHeight: project.image_height ?? null,
        imageAspectRatio: project.image_aspect_ratio ?? null,
        imageMimeType: project.image_mime_type ?? null,
        imageAlt: project.image_alt ?? null,
        storagePath: storagePath ?? null,
        imageVariants,
        blurHash: project.blur_hash ?? null,
        dominantColor: project.dominant_color ?? null,
        tinyPreviewUrl,
        updatedAt: project.updated_at ?? null,
        createdAt: project.created_at ?? null
    };
};

const buildProjectWritePayload = (projectData) => {
    const dbProjectData = {};

    if (projectData.title !== undefined) dbProjectData.title = projectData.title;
    if (projectData.description !== undefined) dbProjectData.description = projectData.description;
    if (projectData.imageSrc !== undefined) dbProjectData.image_src = projectData.imageSrc;
    if (projectData.githubLink !== undefined) dbProjectData.github_link = projectData.githubLink;
    if (projectData.liveDemoLink !== undefined) dbProjectData.live_demo_link = projectData.liveDemoLink;

    if (projectData.techSection !== undefined) {
        if (Array.isArray(projectData.techSection)) {
            dbProjectData.techSection = JSON.stringify(projectData.techSection);
        } else {
            dbProjectData.techSection = projectData.techSection;
        }
    }

    if (projectData.imageWidth !== undefined) dbProjectData.image_width = projectData.imageWidth;
    if (projectData.imageHeight !== undefined) dbProjectData.image_height = projectData.imageHeight;
    if (projectData.imageAspectRatio !== undefined) dbProjectData.image_aspect_ratio = projectData.imageAspectRatio;
    if (projectData.imageMimeType !== undefined) dbProjectData.image_mime_type = projectData.imageMimeType;
    if (projectData.imageAlt !== undefined) dbProjectData.image_alt = projectData.imageAlt;
    if (projectData.storagePath !== undefined) dbProjectData.storage_path = projectData.storagePath;
    if (projectData.blurHash !== undefined) dbProjectData.blur_hash = projectData.blurHash;
    if (projectData.dominantColor !== undefined) dbProjectData.dominant_color = projectData.dominantColor;
    if (projectData.tinyPreviewUrl !== undefined) dbProjectData.tiny_preview_url = projectData.tinyPreviewUrl;

    if (dbProjectData.tiny_preview_url === undefined && dbProjectData.storage_path) {
        dbProjectData.tiny_preview_url = buildTinyPreviewUrlFromPath(dbProjectData.storage_path);
    }

    return dbProjectData;
};

const toProjectFallbackPayload = (payload) => {
    const fallback = {};
    const allowedKeys = ['title', 'description', 'image_src', 'github_link', 'live_demo_link', 'techSection'];

    for (const key of allowedKeys) {
        if (payload[key] !== undefined) {
            fallback[key] = payload[key];
        }
    }

    return fallback;
};

const userService = {
    login: async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) {
                throw error;
            }
            
            return data;
        } catch (error) {
            throw error;
        }
    },
    register: async (userData) => {
        try {
            const { email, password } = userData;
            const { data, error } = await supabase.auth.signUp({
                email,
                password
            });
            
            if (error) {
                throw error;
            }
            
            return data;
        } catch (error) {
            throw error;
        }
    },
    logout: async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                throw error;
            }
            return true;
        } catch (error) {
            throw error;
        }
    }
};

const projectService = {
    uploadImage: async (file, fileName, user = null, preventDuplicates = false) => {
        try {
            // Generar un nombre único para el archivo
            const timestamp = Date.now();
            const sanitizedName = String(fileName || 'image')
                .replace(/\s+/g, '-')
                .replace(/[^a-zA-Z0-9._-]/g, '');
            const uniqueFileName = `projects/${timestamp}_${sanitizedName}`;
            
            // Opcional: Verificar duplicados basados en contenido (hash)
            if (preventDuplicates) {
                // Esta funcionalidad se puede implementar más adelante si es necesaria
            }
            
            // Subir directamente al bucket Images (sin verificar si existe)
            const { data, error } = await supabase.storage
                .from(IMAGE_BUCKET)
                .upload(uniqueFileName, file, {
                    cacheControl: '31536000',
                    upsert: true,
                    contentType: 'image/*'
                });

            if (error) {
                // Proporcionar información más específica del error
                if (error.message.includes('policy') || error.statusCode === '403') {
                    throw new Error(`Error de permisos RLS: ${error.message}. 
                    
Solución: Ejecuta estas consultas en Supabase Dashboard > SQL Editor:

CREATE POLICY IF NOT EXISTS "Allow public uploads to Images bucket" 
ON storage.objects FOR INSERT TO public 
WITH CHECK (bucket_id = 'Images');

CREATE POLICY IF NOT EXISTS "Allow public access to Images bucket" 
ON storage.objects FOR SELECT TO public 
USING (bucket_id = 'Images');`);
                }
                
                throw error;
            }

            // Obtener la URL pública de la imagen
            const { data: publicUrlData } = supabase.storage
                .from(IMAGE_BUCKET)
                .getPublicUrl(uniqueFileName);

            return {
                publicUrl: publicUrlData.publicUrl,
                storagePath: uniqueFileName
            };
            
        } catch (error) {
            throw error;
        }
    },

    deleteImageFromStorage: async (imageUrl) => {
        try {
            // Extraer el nombre del archivo de la URL
            const urlParts = imageUrl.split('/');
            const fileName = urlParts[urlParts.length - 1];
            const folderPath = urlParts[urlParts.length - 2];
            const fullPath = `${folderPath}/${fileName}`;
            
            const { data, error } = await supabase.storage
                .from(IMAGE_BUCKET)
                .remove([fullPath]);

            if (error) {
                throw error;
            }
            
            return data;
        } catch (error) {
            throw error;
        }
    },

    create: async (projectData) => {
        const dbProjectData = buildProjectWritePayload(projectData);

        let { data, error } = await supabase
            .from('proyectos')
            .insert([dbProjectData])
            .select();

        if (error && isMissingColumnError(error)) {
            const fallbackPayload = toProjectFallbackPayload(dbProjectData);
            ({ data, error } = await supabase
                .from('proyectos')
                .insert([fallbackPayload])
                .select());
        }

        if (error) throw error;
        return (data || []).map(sanitizeProjectReadModel);
    },
    read: async () => {
        let { data, error } = await supabase
            .from('proyectos')
            .select(PROJECT_READ_COLUMNS)
            .order('updated_at', { ascending: false, nullsFirst: false });

        if (error && isMissingColumnError(error)) {
            ({ data, error } = await supabase
                .from('proyectos')
                .select(PROJECT_BASE_COLUMNS.join(','))
                .order('id', { ascending: false, nullsFirst: false }));
        }

        if (error) throw error;

        return (data || []).map(sanitizeProjectReadModel);
    },
    getById: async (id) => {
        let { data, error } = await supabase
            .from('proyectos')
            .select(PROJECT_READ_COLUMNS)
            .eq('id', id)
            .single();

        if (error && isMissingColumnError(error)) {
            ({ data, error } = await supabase
                .from('proyectos')
                .select(PROJECT_BASE_COLUMNS.join(','))
                .eq('id', id)
                .single());
        }

        if (error) throw error;
        return sanitizeProjectReadModel(data);
    },
    update: async (id, projectData) => {
        const dbProjectData = buildProjectWritePayload(projectData);

        let { data, error } = await supabase
            .from('proyectos')
            .update(dbProjectData)
            .match({ id })
            .select();

        if (error && isMissingColumnError(error)) {
            const fallbackPayload = toProjectFallbackPayload(dbProjectData);
            ({ data, error } = await supabase
                .from('proyectos')
                .update(fallbackPayload)
                .match({ id })
                .select());
        }

        if (error) throw error;
        return (data || []).map(sanitizeProjectReadModel);
    },
    delete: async (id) => {
        const { data, error } = await supabase
            .from('proyectos')
            .delete()
            .match({ id });
        if (error) throw error;
        return data;
    }
};

const profileService = {
    read: async () => {
        let { data, error } = await supabase
            .from('presentador')
            .select('id,nombre,perfil_url,about_me_description,contact_email,updated_at')
            .limit(1) // Solo nos interesa el primer y único resultado
            .single(); // .single() es un helper que devuelve un objeto en vez de un array

        if (error && isMissingColumnError(error)) {
            ({ data, error } = await supabase
                .from('presentador')
                .select('id,nombre,perfil_url,about_me_description,contact_email')
                .limit(1)
                .single());
        }

    if (error && error.code !== 'PGRST116') {
      // PGRST116 es el código para "no rows returned", lo cual es normal si no se ha creado.
      throw error;
    }

    // Convertir snake_case a camelCase para el frontend
    if (data) {
      const mappedData = {
        id: data.id,
        nombre: data.nombre,
        perfilUrl: data.perfil_url,
        aboutMeDescription: data.about_me_description,
                contactEmail: data.contact_email,
                updatedAt: data.updated_at ?? null
      };
      return mappedData;
    }

    return data;
  },
  create: async (presentadorData) => {
    try {
      // Mapear campos de camelCase a snake_case según la estructura de BD
      const fieldMapping = {
        'nombre': 'nombre',
        'perfilUrl': 'perfil_url',
        'aboutMeDescription': 'about_me_description',
        'contactEmail': 'contact_email'
      };

      const filteredData = {};
      
      // Mapear y filtrar campos
      for (const [camelField, snakeField] of Object.entries(fieldMapping)) {
        if (presentadorData[camelField] !== undefined && presentadorData[camelField] !== null) {
          filteredData[snakeField] = presentadorData[camelField];
        }
      }

      // 1. Primero, intentamos obtener el presentador actual
      const presentadorActual = await profileService.read();

      let data, error;

      if (presentadorActual) {
        // 2. Si existe, lo actualizamos (UPDATE)
        ({ data, error } = await supabase
          .from('presentador')
          .update(filteredData)
          .eq('id', presentadorActual.id) // Apuntamos al ID del registro existente
          .select()
          .single());
      } else {
        // 3. Si no existe, lo creamos (INSERT)
        ({ data, error } = await supabase
          .from('presentador')
          .insert(filteredData)
          .select()
          .single());
      }

      if (error) {
        throw error;
      }

      // Mapear datos de respuesta de snake_case a camelCase
      if (data) {
        const mappedResponse = {
          id: data.id,
          nombre: data.nombre,
          perfilUrl: data.perfil_url,
          aboutMeDescription: data.about_me_description,
                    contactEmail: data.contact_email,
                    updatedAt: data.updated_at ?? null
        };
        return mappedResponse;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }
}

export {
    userService,
    projectService,
    profileService
}