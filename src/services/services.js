import supabase from '../config/config.js';

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
            const uniqueFileName = `projects/${timestamp}_${fileName}`;
            
            // Opcional: Verificar duplicados basados en contenido (hash)
            if (preventDuplicates) {
                // Esta funcionalidad se puede implementar más adelante si es necesaria
            }
            
            // Subir directamente al bucket Images (sin verificar si existe)
            const { data, error } = await supabase.storage
                .from('Images')
                .upload(uniqueFileName, file, {
                    cacheControl: '3600',
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
                .from('Images')
                .getPublicUrl(uniqueFileName);
                
            return publicUrlData.publicUrl;
            
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
                .from('Images')
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
        // Mapear campos de camelCase a snake_case para la base de datos
        const dbProjectData = {
            title: projectData.title,
            description: projectData.description,
            image_src: projectData.imageSrc,
            github_link: projectData.githubLink,
            live_demo_link: projectData.liveDemoLink,
            techSection: projectData.techSection
        };

        const { data, error } = await supabase
            .from('proyectos')
            .insert([dbProjectData]);
        if (error) throw error;
        return data;
    },
    read: async () => {
        const { data, error } = await supabase
            .from('proyectos')
            .select('*');
        if (error) throw error;
        return data;
    },
    getById: async (id) => {
        const { data, error } = await supabase
            .from('proyectos')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },
    update: async (id, projectData) => {
        // Mapear campos de camelCase a snake_case para la base de datos
        const dbProjectData = {};
        
        // Mapear solo los campos que están presentes en projectData
        if (projectData.title !== undefined) dbProjectData.title = projectData.title;
        if (projectData.description !== undefined) dbProjectData.description = projectData.description;
        if (projectData.imageSrc !== undefined) dbProjectData.image_src = projectData.imageSrc;
        if (projectData.githubLink !== undefined) dbProjectData.github_link = projectData.githubLink;
        if (projectData.liveDemoLink !== undefined) dbProjectData.live_demo_link = projectData.liveDemoLink;
        if (projectData.techSection !== undefined) dbProjectData.techSection = projectData.techSection;

        const { data, error } = await supabase
            .from('proyectos')
            .update(dbProjectData)
            .match({ id });
        if (error) throw error;
        return data;
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
    const { data, error } = await supabase
      .from('presentador')
      .select('*')
      .limit(1) // Solo nos interesa el primer y único resultado
      .single(); // .single() es un helper que devuelve un objeto en vez de un array

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
        contactEmail: data.contact_email
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
          contactEmail: data.contact_email
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