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
    uploadImage: async (file, fileName) => {
        try {
            // Generar un nombre único para el archivo
            const timestamp = Date.now();
            const uniqueFileName = `${timestamp}_${fileName}`;
            
            // Subir la imagen al storage de Supabase
            const { data, error } = await supabase.storage
                .from('Images')
                .upload(uniqueFileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            // Obtener la URL pública de la imagen
            const { data: publicUrlData } = supabase.storage
                .from('Images')
                .getPublicUrl(uniqueFileName);

            return publicUrlData.publicUrl;
        } catch (error) {
            console.error('Error al subir la imagen:', error);
            throw error;
        }
    },

    create: async (projectData) => {
        const { data, error } = await supabase
            .from('proyectos')
            .insert([projectData]);
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
    update: async (id, projectData) => {
        const { data, error } = await supabase
            .from('proyectos')
            .update(projectData)
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
      console.error('Error al obtener el presentador:', error);
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

      console.log('🔄 Datos filtrados para BD:', filteredData);

      // 1. Primero, intentamos obtener el presentador actual
      const presentadorActual = await profileService.read();

      let data, error;

      if (presentadorActual) {
        // 2. Si existe, lo actualizamos (UPDATE)
        console.log('Presentador existente, actualizando...');
        ({ data, error } = await supabase
          .from('presentador')
          .update(filteredData)
          .eq('id', presentadorActual.id) // Apuntamos al ID del registro existente
          .select()
          .single());
      } else {
        // 3. Si no existe, lo creamos (INSERT)
        console.log('No hay presentador, creando nuevo registro...');
        ({ data, error } = await supabase
          .from('presentador')
          .insert(filteredData)
          .select()
          .single());
      }

      if (error) {
        console.error('Error al guardar el presentador:', error);
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
      console.error('Error en profileService.create:', error);
      throw error;
    }
  }
}

export {
    userService,
    projectService,
    profileService
}