import supabase from '../config/config.js';

const userService = {
    login: async (email, password) => {
        const {data,error} = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        return data;
    },
    register: async (userData) => {
        const { email, password } = userData;
        const {data,error} = await supabase.auth.signUp({
            email,
            password
        });
        if (error) throw error;
        return data;
    },
    logout: async () => {
        const {error} = await supabase.auth.signOut();
        if (error) throw error;
        return true;
    }
};

const projectService = {
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

    return data;
  },
  create: async (presentadorData) => {
    // 1. Primero, intentamos obtener el presentador actual
    const presentadorActual = await profileService.read();

    let data, error;

    if (presentadorActual) {
      // 2. Si existe, lo actualizamos (UPDATE)
      console.log('Presentador existente, actualizando...');
      ({ data, error } = await supabase
        .from('presentador')
        .update(presentadorData)
        .eq('id', presentadorActual.id) // Apuntamos al ID del registro existente
        .select()
        .single());
    } else {
      // 3. Si no existe, lo creamos (INSERT)
      console.log('No hay presentador, creando nuevo registro...');
      ({ data, error } = await supabase
        .from('presentador')
        .insert(presentadorData)
        .select()
        .single());
    }

    if (error) {
      console.error('Error al guardar el presentador:', error);
      throw error;
    }

    return data;
  }
}

export {
    userService,
    projectService,
    profileService
}