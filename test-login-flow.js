const BASE_URL = 'http://localhost:3000';

async function loginAndTest() {
  console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║          🔐 PRUEBA DE LOGIN Y ENDPOINTS AUTENTICADOS                         ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  // Paso 1: Login para obtener un token fresco
  console.log('📝 Paso 1: Iniciando sesión para obtener token fresco...\n');
  
  try {
    const loginResponse = await fetch(`${BASE_URL}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'agusmaty23@gmail.com',
        password: process.argv[2] || '' // Pasar password como argumento
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok) {
      console.log('❌ Error en el login:');
      console.log(JSON.stringify(loginData, null, 2));
      console.log('\n⚠️  Por favor, ejecuta el script con la contraseña:');
      console.log('   node test-login-flow.js TU_PASSWORD\n');
      return;
    }

    console.log('✅ Login exitoso!');
    console.log(`📧 Email: ${loginData.data.user.email}`);
    console.log(`🆔 User ID: ${loginData.data.user.id}`);
    
    const accessToken = loginData.data.session.access_token;
    console.log(`🔑 Token obtenido: ${accessToken.substring(0, 50)}...\n`);

    // Paso 2: Probar endpoints protegidos con el token fresco
    console.log('📝 Paso 2: Probando endpoints protegidos...\n');

    // Test: Crear perfil
    console.log('🧪 Test 1: Actualizar perfil (POST /api/profiles/create)');
    const profileResponse = await fetch(`${BASE_URL}/api/profiles/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        nombre: 'Test User - API Testing',
        perfilUrl: 'https://ui-avatars.com/api/?name=API+Test&size=200',
        aboutMeDescription: 'Este perfil fue actualizado mediante pruebas automatizadas con token fresco',
        contactEmail: 'test@apitest.com'
      })
    });
    
    const profileData = await profileResponse.json();
    if (profileResponse.ok) {
      console.log('✅ Perfil actualizado exitosamente');
      console.log(`   - Nombre: ${profileData.data?.nombre}`);
      console.log(`   - Email: ${profileData.data?.contactEmail}\n`);
    } else {
      console.log('❌ Error al actualizar perfil:');
      console.log(JSON.stringify(profileData, null, 2) + '\n');
    }

    // Test: Crear proyecto
    console.log('🧪 Test 2: Crear proyecto (POST /api/projects/create)');
    const projectResponse = await fetch(`${BASE_URL}/api/projects/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        title: `Proyecto de Prueba - ${new Date().toLocaleTimeString()}`,
        description: 'Este es un proyecto creado mediante pruebas automatizadas con autenticación válida',
        imageSrc: 'https://picsum.photos/seed/test/800/600',
        githubLink: 'https://github.com/test/automated-project',
        liveDemoLink: 'https://demo-test.example.com',
        techSection: 'Node.js,Express.js,Supabase,Jest'
      })
    });

    const projectData = await projectResponse.json();
    if (projectResponse.ok) {
      console.log('✅ Proyecto creado exitosamente');
      console.log(JSON.stringify(projectData, null, 2) + '\n');
    } else {
      console.log('❌ Error al crear proyecto:');
      console.log(JSON.stringify(projectData, null, 2) + '\n');
    }

    // Test: Obtener proyectos
    console.log('🧪 Test 3: Obtener proyectos (GET /api/projects/read)');
    const getProjectsResponse = await fetch(`${BASE_URL}/api/projects/read`);
    const projectsData = await getProjectsResponse.json();
    
    if (getProjectsResponse.ok) {
      console.log(`✅ Se obtuvieron ${projectsData.data.length} proyectos`);
      
      // Buscar proyectos de prueba
      const testProjects = projectsData.data.filter(p => 
        p.title.toLowerCase().includes('prueba') || p.title.toLowerCase().includes('test')
      );
      
      console.log(`   - Proyectos de prueba encontrados: ${testProjects.length}\n`);
      
      if (testProjects.length > 0) {
        const projectToUpdate = testProjects[0];
        console.log(`🧪 Test 4: Actualizar proyecto (PUT /api/projects/update/${projectToUpdate.id})`);
        
        const updateResponse = await fetch(`${BASE_URL}/api/projects/update/${projectToUpdate.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            title: `${projectToUpdate.title} - UPDATED`,
            description: 'Descripción actualizada mediante test automatizado',
            imageSrc: projectToUpdate.image_src,
            techSection: 'Node.js,Express.js,Supabase,Jest,Updated'
          })
        });

        const updateData = await updateResponse.json();
        if (updateResponse.ok) {
          console.log('✅ Proyecto actualizado exitosamente\n');
        } else {
          console.log('❌ Error al actualizar proyecto:');
          console.log(JSON.stringify(updateData, null, 2) + '\n');
        }

        // Test: Eliminar proyecto
        console.log(`🧪 Test 5: Eliminar proyecto (DELETE /api/projects/delete/${projectToUpdate.id})`);
        const deleteResponse = await fetch(`${BASE_URL}/api/projects/delete/${projectToUpdate.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        const deleteData = await deleteResponse.json();
        if (deleteResponse.ok) {
          console.log('✅ Proyecto eliminado exitosamente\n');
        } else {
          console.log('❌ Error al eliminar proyecto:');
          console.log(JSON.stringify(deleteData, null, 2) + '\n');
        }
      }
    }

    // Test: Logout
    console.log('🧪 Test 6: Cerrar sesión (POST /api/users/logout)');
    const logoutResponse = await fetch(`${BASE_URL}/api/users/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const logoutData = await logoutResponse.json();
    if (logoutResponse.ok) {
      console.log('✅ Logout exitoso\n');
    } else {
      console.log('❌ Error al hacer logout:');
      console.log(JSON.stringify(logoutData, null, 2) + '\n');
    }

    // Restaurar datos originales
    console.log('🔄 Restaurando datos originales del perfil...');
    const restoreResponse = await fetch(`${BASE_URL}/api/profiles/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        nombre: 'Mathías Terán',
        perfilUrl: 'https://lifmgeummpnuemocghmm.supabase.co/storage/v1/object/public/Images/imagen%20perfil.jpeg',
        aboutMeDescription: 'Hello, I am a junior software developer specializing in full-stack development with Node.js. I enjoy transforming ideas into interactive experiences and I am into continuous learning. I am searching opportunities that allow me to grow and contribute to projects in the field of software development.',
        contactEmail: 'agusmaty.a23@gmail.com'
      })
    });

    if (restoreResponse.ok) {
      console.log('✅ Perfil restaurado exitosamente\n');
    }

    console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                       ✨ TODAS LAS PRUEBAS COMPLETADAS                       ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  } catch (error) {
    console.error('💥 Error durante las pruebas:', error.message);
  }
}

loginAndTest();
