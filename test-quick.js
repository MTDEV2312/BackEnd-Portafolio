const BASE_URL = 'http://localhost:3000';

// Token proporcionado por el usuario
const PROVIDED_TOKEN = 'eyJhbGciOiJIUzI1NiIsImtpZCI6InpzTFFZMld3WWpXTnkrMXUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2xpZm1nZXVtbXBudWVtb2NnaG1tLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI0NDYyYzIyNS0wMzA5LTRmNjItYjkwOS1kY2EyNTRjZmUyMzkiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzY4OTYwNjM3LCJpYXQiOjE3Njg5NTcwMzcsImVtYWlsIjoiYWd1c21hdHkyM0BnbWFpbC5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsX3ZlcmlmaWVkIjp0cnVlfSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc2ODk1NzAzN31dLCJzZXNzaW9uX2lkIjoiY2U4Y2YzZjUtOThlYy00OTQ4LTg5ODAtNjg0MDUxZTdkYWM2IiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.mdPAJTVSkGs1QChx4OLzhtUPD1NNXA4-xLPcmNxAE8A';

async function makeRequest(method, endpoint, body = null, useAuth = true, customToken = null) {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (useAuth) {
    const token = customToken || PROVIDED_TOKEN;
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  console.log(`\n${'═'.repeat(80)}`);
  console.log(`🔄 ${method} ${endpoint}`);
  console.log(`${'═'.repeat(80)}`);
  
  if (useAuth) {
    console.log(`🔑 Autenticación: Bearer ${(customToken || PROVIDED_TOKEN).substring(0, 30)}...`);
  } else {
    console.log(`📂 Acceso: Público (sin autenticación)`);
  }

  if (body) {
    console.log(`\n📤 Request Body:`);
    console.log(JSON.stringify(body, null, 2));
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();

    console.log(`\n📥 Response Status: ${response.status} ${response.statusText}`);
    console.log(`\n📋 Response Data:`);
    console.log(JSON.stringify(data, null, 2));
    console.log(`${'═'.repeat(80)}\n`);

    return { status: response.status, data };
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    console.log(`${'═'.repeat(80)}\n`);
    return { error: error.message };
  }
}

async function quickTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                    🧪 PRUEBAS RÁPIDAS DE API REST                          ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');
  console.log('\n📡 URL Base:', BASE_URL);
  console.log('🕐 Hora:', new Date().toLocaleString('es-ES'));
  console.log('\n');

  // ENDPOINTS PÚBLICOS
  console.log('┌────────────────────────────────────────────────────────────────────────────┐');
  console.log('│  📂 ENDPOINTS PÚBLICOS                                                     │');
  console.log('└────────────────────────────────────────────────────────────────────────────┘');

  await makeRequest('GET', '/api/profiles/read', null, false);
  await makeRequest('GET', '/api/projects/read', null, false);

  // ENDPOINTS PROTEGIDOS
  console.log('\n┌────────────────────────────────────────────────────────────────────────────┐');
  console.log('│  🔒 ENDPOINTS PROTEGIDOS (usando token proporcionado)                     │');
  console.log('└────────────────────────────────────────────────────────────────────────────┘');

  // Crear Proyecto
  await makeRequest('POST', '/api/projects/create', {
    title: `Proyecto de Prueba ${new Date().toLocaleTimeString()}`,
    description: 'Proyecto creado mediante pruebas automatizadas con el token proporcionado',
    imageSrc: 'https://picsum.photos/seed/apitest/800/600',
    githubLink: 'https://github.com/test/automated-project',
    liveDemoLink: 'https://test.example.com',
    techSection: 'Node.js,Express.js,Supabase,Testing'
  });

  // Actualizar Perfil
  await makeRequest('POST', '/api/profiles/create', {
    nombre: 'Usuario API Test',
    perfilUrl: 'https://ui-avatars.com/api/?name=API+Test&background=random&size=200',
    aboutMeDescription: 'Perfil de prueba actualizado mediante API',
    contactEmail: 'apitest@example.com'
  });

  // Logout
  await makeRequest('POST', '/api/users/logout');

  // PRUEBAS DE SEGURIDAD
  console.log('\n┌────────────────────────────────────────────────────────────────────────────┐');
  console.log('│  🛡️  PRUEBAS DE SEGURIDAD                                                  │');
  console.log('└────────────────────────────────────────────────────────────────────────────┘');

  await makeRequest('POST', '/api/projects/create', {
    title: 'Intento sin token',
    description: 'Esto debería fallar',
    imageSrc: 'https://picsum.photos/800/600',
    techSection: 'Test'
  }, false);

  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                          ✅ PRUEBAS COMPLETADAS                            ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

  // Restaurar perfil original
  console.log('🔄 Restaurando perfil original...\n');
  await makeRequest('POST', '/api/profiles/create', {
    nombre: 'Mathías Terán',
    perfilUrl: 'https://lifmgeummpnuemocghmm.supabase.co/storage/v1/object/public/Images/imagen%20perfil.jpeg',
    aboutMeDescription: 'Hello, I am a junior software developer specializing in full-stack development with Node.js. I enjoy transforming ideas into interactive experiences and I am into continuous learning. I am searching opportunities that allow me to grow and contribute to projects in the field of software development.',
    contactEmail: 'agusmaty.a23@gmail.com'
  });

  console.log('✅ Perfil restaurado\n');
}

// Ejecutar pruebas
quickTests().catch(console.error);
