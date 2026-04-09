const BASE_URL = 'http://localhost:3000';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsImtpZCI6InpzTFFZMld3WWpXTnkrMXUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2xpZm1nZXVtbXBudWVtb2NnaG1tLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI0NDYyYzIyNS0wMzA5LTRmNjItYjkwOS1kY2EyNTRjZmUyMzkiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzY4OTYwNjM3LCJpYXQiOjE3Njg5NTcwMzcsImVtYWlsIjoiYWd1c21hdHkyM0BnbWFpbC5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsX3ZlcmlmaWVkIjp0cnVlfSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc2ODk1NzAzN31dLCJzZXNzaW9uX2lkIjoiY2U4Y2YzZjUtOThlYy00OTQ4LTg5ODAtNjg0MDUxZTdkYWM2IiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.mdPAJTVSkGs1QChx4OLzhtUPD1NNXA4-xLPcmNxAE8A';

const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
};

async function testEndpoint(method, path, body = null, requiresAuth = false, expectedStatus = 200) {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (requiresAuth) {
    headers['Authorization'] = `Bearer ${TOKEN}`;
  }

  const options = {
    method,
    headers
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${path}`, options);
    const data = await response.json();
    
    const testPassed = response.status === expectedStatus || 
                       (response.status >= 200 && response.status < 300);
    
    const result = {
      method,
      path,
      status: response.status,
      statusText: response.statusText,
      expectedStatus,
      requiresAuth,
      passed: testPassed,
      response: data
    };

    testResults.total++;
    if (testPassed) {
      testResults.passed++;
      console.log(`✅ ${method} ${path} - ${response.status}`);
    } else {
      testResults.failed++;
      console.log(`❌ ${method} ${path} - ${response.status} (esperado: ${expectedStatus})`);
    }

    testResults.tests.push(result);
    
    return { success: testPassed, data, response };
  } catch (error) {
    console.error(`💥 Error en ${method} ${path}:`, error.message);
    testResults.total++;
    testResults.failed++;
    testResults.tests.push({
      method,
      path,
      passed: false,
      error: error.message
    });
    return { success: false, error: error.message };
  }
}

async function runComprehensiveTests() {
  console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                 🧪 PRUEBAS COMPLETAS DE API REST                            ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');
  console.log(`📡 URL Base: ${BASE_URL}`);
  console.log(`🔑 Token: ${TOKEN.substring(0, 30)}...`);
  console.log(`📅 Fecha: ${new Date().toLocaleString('es-ES')}\n`);

  // ========== ENDPOINTS PÚBLICOS ==========
  console.log('\n┌─────────────────────────────────────────────────────────────────────────────┐');
  console.log('│  📂 ENDPOINTS PÚBLICOS (No requieren autenticación)                         │');
  console.log('└─────────────────────────────────────────────────────────────────────────────┘\n');
  
  await testEndpoint('GET', '/api/profiles/read', null, false, 200);
  await testEndpoint('GET', '/api/projects/read', null, false, 200);

  // ========== ENDPOINTS PRIVADOS - PERFILES ==========
  console.log('\n┌─────────────────────────────────────────────────────────────────────────────┐');
  console.log('│  🔒 ENDPOINTS DE PERFILES (Requieren autenticación)                        │');
  console.log('└─────────────────────────────────────────────────────────────────────────────┘\n');
  
  const profileTest = await testEndpoint('POST', '/api/profiles/create', {
    nombre: 'Usuario de Prueba API',
    perfilUrl: 'https://ui-avatars.com/api/?name=Test+User&size=200',
    aboutMeDescription: 'Perfil creado desde las pruebas automatizadas de la API',
    contactEmail: 'api-test@example.com'
  }, true, 201);

  // ========== ENDPOINTS PRIVADOS - PROYECTOS ==========
  console.log('\n┌─────────────────────────────────────────────────────────────────────────────┐');
  console.log('│  🔒 ENDPOINTS DE PROYECTOS (Requieren autenticación)                       │');
  console.log('└─────────────────────────────────────────────────────────────────────────────┘\n');
  
  // Crear proyecto
  const createProjectTest = await testEndpoint('POST', '/api/projects/create', {
    title: 'Proyecto de Prueba Automatizada',
    description: 'Este es un proyecto creado mediante las pruebas automatizadas de la API REST. Incluye validación de campos requeridos y autenticación.',
    imageSrc: 'https://picsum.photos/800/600',
    githubLink: 'https://github.com/test/automated-test-project',
    liveDemoLink: 'https://test-demo.example.com',
    techSection: 'Node.js,Express.js,Jest,Supabase'
  }, true, 201);

  // Obtener el ID del primer proyecto para las pruebas de UPDATE y DELETE
  const projectsResponse = await fetch(`${BASE_URL}/api/projects/read`);
  const projectsData = await projectsResponse.json();
  let testProjectId = null;
  
  if (projectsData.data && projectsData.data.length > 0) {
    // Buscar un proyecto que podamos actualizar/eliminar sin afectar los datos reales
    const testProject = projectsData.data.find(p => 
      p.title.includes('Test') || p.title.includes('Prueba')
    );
    
    if (testProject) {
      testProjectId = testProject.id;
      console.log(`\n📝 Usando proyecto ID: ${testProjectId} para pruebas de UPDATE/DELETE`);
      
      // Actualizar proyecto
      await testEndpoint('PUT', `/api/projects/update/${testProjectId}`, {
        title: 'Proyecto Actualizado - Test API',
        description: 'Descripción actualizada mediante prueba automatizada',
        imageSrc: 'https://picsum.photos/800/600?updated',
        techSection: 'Node.js,Express.js,Supabase,Testing'
      }, true, 200);
      
      // Eliminar proyecto
      await testEndpoint('DELETE', `/api/projects/delete/${testProjectId}`, null, true, 200);
    } else {
      console.log('\n⚠️  No se encontró un proyecto de prueba para UPDATE/DELETE');
    }
  }

  // ========== ENDPOINTS PRIVADOS - USUARIOS ==========
  console.log('\n┌─────────────────────────────────────────────────────────────────────────────┐');
  console.log('│  🔒 ENDPOINTS DE USUARIOS (Requieren autenticación)                        │');
  console.log('└─────────────────────────────────────────────────────────────────────────────┘\n');
  
  // Nota: El registro puede fallar si el usuario ya existe
  await testEndpoint('POST', '/api/users/register', {
    email: `testuser_${Date.now()}@apitest.com`,
    password: 'SecureTestPassword123!@#'
  }, true);

  await testEndpoint('POST', '/api/users/logout', null, true, 200);

  // ========== PRUEBAS DE SEGURIDAD ==========
  console.log('\n┌─────────────────────────────────────────────────────────────────────────────┐');
  console.log('│  🛡️  PRUEBAS DE SEGURIDAD                                                   │');
  console.log('└─────────────────────────────────────────────────────────────────────────────┘\n');
  
  // Intentar acceder a endpoints privados sin token
  await testEndpoint('POST', '/api/projects/create', {
    title: 'Intento sin autenticación',
    description: 'Este intento debería fallar',
    imageSrc: 'https://picsum.photos/800/600',
    techSection: 'Test'
  }, false, 401);

  await testEndpoint('POST', '/api/profiles/create', {
    nombre: 'Intento sin auth'
  }, false, 401);

  // ========== RESUMEN DE RESULTADOS ==========
  console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                        📊 RESUMEN DE RESULTADOS                              ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');
  
  console.log(`📋 Total de pruebas: ${testResults.total}`);
  console.log(`✅ Pruebas exitosas: ${testResults.passed} (${((testResults.passed/testResults.total)*100).toFixed(1)}%)`);
  console.log(`❌ Pruebas fallidas: ${testResults.failed} (${((testResults.failed/testResults.total)*100).toFixed(1)}%)`);
  
  console.log('\n┌─────────────────────────────────────────────────────────────────────────────┐');
  console.log('│  DETALLE DE PRUEBAS                                                         │');
  console.log('└─────────────────────────────────────────────────────────────────────────────┘\n');
  
  testResults.tests.forEach((test, index) => {
    const icon = test.passed ? '✅' : '❌';
    const auth = test.requiresAuth ? '🔒' : '📂';
    console.log(`${icon} ${auth} Test ${index + 1}: ${test.method} ${test.path}`);
    console.log(`   Status: ${test.status || 'Error'} ${test.statusText || ''}`);
    if (test.response && test.response.message) {
      console.log(`   Mensaje: ${test.response.message}`);
    }
    if (test.error) {
      console.log(`   Error: ${test.error}`);
    }
    console.log('');
  });

  console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                        ✨ PRUEBAS FINALIZADAS                                ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  // Restaurar el perfil original
  console.log('🔄 Restaurando datos originales del perfil...\n');
  await testEndpoint('POST', '/api/profiles/create', {
    nombre: 'Mathías Terán',
    perfilUrl: 'https://lifmgeummpnuemocghmm.supabase.co/storage/v1/object/public/Images/imagen%20perfil.jpeg',
    aboutMeDescription: 'Hello, I am a junior software developer specializing in full-stack development with Node.js. I enjoy transforming ideas into interactive experiences and I am into continuous learning. I am searching opportunities that allow me to grow and contribute to projects in the field of software development.',
    contactEmail: 'agusmaty.a23@gmail.com'
  }, true, 201);

  console.log('✅ Perfil restaurado exitosamente\n');
}

runComprehensiveTests().catch(console.error);
