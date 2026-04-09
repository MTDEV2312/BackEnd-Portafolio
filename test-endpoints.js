const BASE_URL = 'http://localhost:3000';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsImtpZCI6InpzTFFZMld3WWpXTnkrMXUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2xpZm1nZXVtbXBudWVtb2NnaG1tLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI0NDYyYzIyNS0wMzA5LTRmNjItYjkwOS1kY2EyNTRjZmUyMzkiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzY4OTYwNjM3LCJpYXQiOjE3Njg5NTcwMzcsImVtYWlsIjoiYWd1c21hdHkyM0BnbWFpbC5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsX3ZlcmlmaWVkIjp0cnVlfSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc2ODk1NzAzN31dLCJzZXNzaW9uX2lkIjoiY2U4Y2YzZjUtOThlYy00OTQ4LTg5ODAtNjg0MDUxZTdkYWM2IiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.mdPAJTVSkGs1QChx4OLzhtUPD1NNXA4-xLPcmNxAE8A';

async function testEndpoint(method, path, body = null, requiresAuth = false) {
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
    
    console.log(`\n${'='.repeat(80)}`);
    console.log(`${method} ${path}`);
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Auth: ${requiresAuth ? 'Required' : 'Public'}`);
    console.log(`${'='.repeat(80)}`);
    console.log('Response:');
    console.log(JSON.stringify(data, null, 2));
    console.log(`${'='.repeat(80)}\n`);
    
    return data;
  } catch (error) {
    console.error(`Error en ${method} ${path}:`, error.message);
  }
}

async function runTests() {
  console.log('\n🧪 INICIANDO PRUEBAS DE ENDPOINTS REST API\n');
  console.log(`📡 URL Base: ${BASE_URL}`);
  console.log(`🔑 Token proporcionado: ${TOKEN.substring(0, 50)}...`);
  console.log('\n');

  // ENDPOINTS PÚBLICOS
  console.log('📂 === ENDPOINTS PÚBLICOS ===\n');
  
  await testEndpoint('GET', '/api/profiles/read', null, false);
  await testEndpoint('GET', '/api/projects/read', null, false);

  // ENDPOINTS PRIVADOS (REQUIEREN AUTENTICACIÓN)
  console.log('\n🔒 === ENDPOINTS PRIVADOS (REQUIEREN AUTENTICACIÓN) ===\n');
  
  // Test 1: Crear perfil
  await testEndpoint('POST', '/api/profiles/create', {
    nombre: 'Test User Updated',
    perfilUrl: 'https://via.placeholder.com/150',
    aboutMeDescription: 'Testing profile endpoint with authentication',
    contactEmail: 'test@example.com'
  }, true);

  // Test 2: Crear proyecto
  await testEndpoint('POST', '/api/projects/create', {
    title: 'Test Project API',
    description: 'Proyecto de prueba creado mediante el endpoint de la API',
    imageSrc: 'https://via.placeholder.com/600x400',
    githubLink: 'https://github.com/test/proyecto-prueba',
    liveDemoLink: 'https://test-project.com',
    techSection: 'Node.js,Express.js,Supabase'
  }, true);

  // Test 3: Registrar nuevo usuario
  await testEndpoint('POST', '/api/users/register', {
    email: `testuser${Date.now()}@example.com`,
    password: 'SecurePassword123!'
  }, true);

  // Test 4: Logout
  await testEndpoint('POST', '/api/users/logout', null, true);

  console.log('\n✅ PRUEBAS COMPLETADAS\n');
}

runTests().catch(console.error);
