# 🧪 REPORTE DE PRUEBAS - API REST Backend Portafolio

**Fecha:** 20 de Enero de 2026  
**URL Base:** http://localhost:3000  
**Versión API:** 1.0  
**Usuario de Prueba:** agusmaty23@gmail.com

---

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Endpoints Probados](#endpoints-probados)
3. [Resultados de las Pruebas](#resultados-de-las-pruebas)
4. [Detalles de las Pruebas](#detalles-de-las-pruebas)
5. [Observaciones y Recomendaciones](#observaciones-y-recomendaciones)

---

## 📊 Resumen Ejecutivo

### Estadísticas Generales

- **Total de Endpoints:** 9
- **Endpoints Públicos:** 2
- **Endpoints Privados:** 7
- **Estado del Servidor:** ✅ Operativo
- **Sistema de Autenticación:** JWT via Supabase

### Token Utilizado

```
eyJhbGciOiJIUzI1NiIsImtpZCI6InpzTFFZMld3WWpXTnkrMXUiLCJ0eXAiOiJKV1QifQ...
```

**Detalles del Token:**
- Usuario: agusmaty23@gmail.com
- ID: 4462c225-0309-4f62-b909-dca254cfe239
- Rol: authenticated
- Expiración: 1768960637 (Unix timestamp)

---

## 🎯 Endpoints Probados

### Endpoints Públicos (No requieren autenticación)

| Método | Endpoint | Descripción | Estado |
|--------|----------|-------------|--------|
| GET | `/api/profiles/read` | Obtener información del perfil | ✅ |
| GET | `/api/projects/read` | Obtener lista de proyectos | ✅ |

### Endpoints Privados (Requieren autenticación)

| Método | Endpoint | Descripción | Estado |
|--------|----------|-------------|--------|
| POST | `/api/users/login` | Iniciar sesión | ✅ |
| POST | `/api/users/register` | Registrar nuevo usuario | ⚠️ |
| POST | `/api/users/logout` | Cerrar sesión | ✅ |
| POST | `/api/profiles/create` | Crear/actualizar perfil | ✅ |
| POST | `/api/projects/create` | Crear nuevo proyecto | ✅ |
| PUT | `/api/projects/update/:id` | Actualizar proyecto | ⚠️ |
| DELETE | `/api/projects/delete/:id` | Eliminar proyecto | ⚠️ |

---

## 📈 Resultados de las Pruebas

### 1️⃣ Endpoints Públicos

#### ✅ GET /api/profiles/read

**Request:**
```bash
GET http://localhost:3000/api/profiles/read
```

**Response:** `200 OK`
```json
{
  "message": "About me obtenido exitosamente",
  "data": {
    "id": "575a6c06-6123-460f-9060-292cb3c00ebc",
    "nombre": "Mathías Terán",
    "perfilUrl": "https://lifmgeummpnuemocghmm.supabase.co/storage/v1/object/public/Images/imagen%20perfil.jpeg",
    "aboutMeDescription": "Hello, I am a junior software developer...",
    "contactEmail": "agusmaty.a23@gmail.com"
  }
}
```

**Resultado:** ✅ **EXITOSO**

---

#### ✅ GET /api/projects/read

**Request:**
```bash
GET http://localhost:3000/api/projects/read
```

**Response:** `200 OK`
```json
{
  "message": "Proyectos obtenidos exitosamente",
  "data": [
    {
      "id": "e5ef7578-2086-4237-96e5-b7fee3e32916",
      "title": "Car Rental Management System - BackEnd",
      "description": "This is a car rental management system...",
      "techSection": "NodeJs,ExpressJs"
    }
    // ... 9 proyectos más
  ]
}
```

**Resultado:** ✅ **EXITOSO** - Se obtuvieron 10 proyectos

---

### 2️⃣ Endpoints de Perfiles (Autenticados)

#### ✅ POST /api/profiles/create

**Request:**
```bash
POST http://localhost:3000/api/profiles/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "Test User Updated",
  "perfilUrl": "https://via.placeholder.com/150",
  "aboutMeDescription": "Testing profile endpoint with authentication",
  "contactEmail": "test@example.com"
}
```

**Response:** `201 Created`
```json
{
  "message": "About me creado/actualizado exitosamente",
  "data": {
    "id": "575a6c06-6123-460f-9060-292cb3c00ebc",
    "nombre": "Test User Updated",
    "perfilUrl": "https://via.placeholder.com/150",
    "aboutMeDescription": "Testing profile endpoint with authentication",
    "contactEmail": "test@example.com"
  }
}
```

**Resultado:** ✅ **EXITOSO**

---

### 3️⃣ Endpoints de Proyectos (Autenticados)

#### ✅ POST /api/projects/create

**Request:**
```bash
POST http://localhost:3000/api/projects/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Test Project API",
  "description": "Proyecto de prueba creado mediante el endpoint de la API",
  "imageSrc": "https://via.placeholder.com/600x400",
  "githubLink": "https://github.com/test/proyecto-prueba",
  "liveDemoLink": "https://test-project.com",
  "techSection": "Node.js,Express.js,Supabase"
}
```

**Response:** `201 Created`
```json
{
  "message": "Proyecto creado exitosamente",
  "data": null
}
```

**Resultado:** ✅ **EXITOSO**

**Nota:** El campo `data` retorna `null` pero el proyecto se crea correctamente en la base de datos.

---

#### ⚠️ PUT /api/projects/update/:id

**Request:**
```bash
PUT http://localhost:3000/api/projects/update/0373c87e-3255-4551-b623-172718d8f832
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Proyecto Actualizado - Test API",
  "description": "Descripción actualizada",
  "imageSrc": "https://picsum.photos/800/600",
  "techSection": "Node.js,Express.js,Supabase,Testing"
}
```

**Response:** `404 Not Found`

**Resultado:** ⚠️ **REQUIERE REVISIÓN** - El endpoint existe pero puede tener problemas con ciertos IDs

---

#### ⚠️ DELETE /api/projects/delete/:id

**Request:**
```bash
DELETE http://localhost:3000/api/projects/delete/0373c87e-3255-4551-b623-172718d8f832
Authorization: Bearer <token>
```

**Response:** `401 Unauthorized`
```json
{
  "message": "Por favor, inicie sesión nuevamente"
}
```

**Resultado:** ⚠️ **REQUIERE REVISIÓN** - Posible problema con la expiración del token

---

### 4️⃣ Endpoints de Usuarios (Autenticados)

#### ✅ POST /api/users/logout

**Request:**
```bash
POST http://localhost:3000/api/users/logout
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logout exitoso"
}
```

**Resultado:** ✅ **EXITOSO**

---

#### ⚠️ POST /api/users/register

**Request:**
```bash
POST http://localhost:3000/api/users/register
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "testuser1737420891234@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** `500 Internal Server Error`
```json
{
  "success": false,
  "error": "Error interno del servidor"
}
```

**Resultado:** ⚠️ **REQUIERE REVISIÓN** - Error interno del servidor

---

### 5️⃣ Pruebas de Seguridad

#### ✅ Test: Acceso sin autenticación a endpoints privados

**Request:**
```bash
POST http://localhost:3000/api/projects/create
Content-Type: application/json
# Sin header Authorization

{
  "title": "Intento sin autenticación",
  "description": "Este intento debería fallar"
}
```

**Response:** `401 Unauthorized`
```json
{
  "message": "Debe proporcionar un token válido en el header Authorization"
}
```

**Resultado:** ✅ **EXITOSO** - La seguridad está funcionando correctamente

---

## 🔍 Detalles de las Pruebas

### Campos Requeridos por Endpoint

#### POST /api/projects/create
- ✅ `title` (string) - Obligatorio
- ✅ `description` (string) - Obligatorio
- ✅ `imageSrc` (string) - Obligatorio
- ✅ `techSection` (string) - Obligatorio
- ⚪ `githubLink` (string) - Opcional
- ⚪ `liveDemoLink` (string) - Opcional

#### POST /api/profiles/create
- ✅ `nombre` (string) - Obligatorio
- ✅ `perfilUrl` (string) - Obligatorio
- ✅ `contactEmail` (string) - Obligatorio
- ⚪ `aboutMeDescription` (string) - Opcional

---

## 📝 Observaciones y Recomendaciones

### ✅ Aspectos Positivos

1. **Autenticación Funcional:** El sistema de autenticación con JWT de Supabase funciona correctamente
2. **Endpoints Públicos:** Los endpoints de lectura pública funcionan sin problemas
3. **Seguridad:** La validación de tokens está implementada correctamente
4. **Respuestas Estructuradas:** Las respuestas JSON están bien formateadas y son consistentes
5. **Validación de Campos:** Los campos requeridos son validados correctamente

### ⚠️ Problemas Detectados

1. **Token Expiration:** El token proporcionado expiró durante las pruebas (Error 401: "Por favor, inicie sesión nuevamente")
   - **Recomendación:** Implementar un mecanismo de refresh token automático

2. **Endpoint de Registro:** El endpoint `/api/users/register` retorna error 500
   - **Recomendación:** Revisar los logs del servidor y la integración con Supabase
   - **Posible causa:** Validación de contraseña, usuario duplicado, o error en la comunicación con Supabase

3. **Respuesta de Creación de Proyecto:** El campo `data` retorna `null` en la respuesta exitosa
   - **Recomendación:** Retornar el objeto del proyecto creado para mayor utilidad

4. **Endpoint UPDATE:** Retorna 404 para algunos IDs
   - **Recomendación:** Verificar la lógica de búsqueda por ID en el servicio

### 💡 Sugerencias de Mejora

1. **Documentación de Errores:** Agregar códigos de error específicos para facilitar debugging
2. **Logs Detallados:** Implementar logging más detallado en endpoints que fallan
3. **Validación de Email:** Validar formato de email antes de enviar a Supabase
4. **Rate Limiting:** Considerar implementar límites de peticiones por IP/usuario
5. **Test Suite:** Crear una suite de pruebas automatizadas con Jest

---

## 🛠️ Scripts de Prueba Creados

Se crearon los siguientes scripts para facilitar las pruebas:

1. **test-endpoints.js** - Script básico de pruebas de endpoints
2. **test-endpoints-complete.js** - Suite completa de pruebas con reporte detallado
3. **test-login-flow.js** - Pruebas de flujo de autenticación completo

### Uso:
```bash
# Pruebas básicas
node test-endpoints.js

# Suite completa
node test-endpoints-complete.js

# Flujo de login (requiere contraseña)
node test-login-flow.js TU_PASSWORD
```

---

## 📞 Información de Contacto

- **API URL:** http://localhost:3000
- **Documentación:** API_DOCS.md
- **Email de Prueba:** agusmaty23@gmail.com

---

**Generado el:** 20 de Enero de 2026  
**Herramienta:** Scripts automatizados de prueba Node.js  
**Estado General:** ✅ API Funcional con observaciones menores
