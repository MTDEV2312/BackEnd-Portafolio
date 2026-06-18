# API Backend - Sistema de Autenticación

Este backend utiliza Supabase para la autenticación y autorización de usuarios.

## Rutas Públicas (No requieren autenticación)

### Usuarios
- `POST /api/users/login` - Iniciar sesión

### Perfiles
- `GET /api/profiles/read` - Obtener información del perfil

### Proyectos
- `GET /api/projects/read` - Obtener lista de proyectos

## Rutas Privadas (Requieren autenticación)

### Usuarios
- `POST /api/users/register` - Registrar nuevo usuario
- `POST /api/users/logout` - Cerrar sesión

### Perfiles
- `POST /api/profiles/create` - Crear/actualizar perfil

### Proyectos
- `POST /api/projects/create` - Crear nuevo proyecto
- `PUT /api/projects/update/:id` - Actualizar proyecto
- `DELETE /api/projects/delete/:id` - Eliminar proyecto

## Subida de Imágenes en Proyectos

Los endpoints de creación y actualización de proyectos soportan dos formas de manejar imágenes:

### Opción 1: Subir archivo de imagen
Usar `Content-Type: multipart/form-data` y enviar:
- `image`: Archivo de imagen (campo de archivo)
- `title`: Título del proyecto
- `description`: Descripción del proyecto
- `githubLink`: (opcional) Enlace a GitHub
- `liveDemoLink`: (opcional) Enlace a demo en vivo

### Opción 2: Proporcionar URL de imagen
Usar `Content-Type: application/json` y enviar:
- `imageSrc`: URL de la imagen
- `title`: Título del proyecto
- `description`: Descripción del proyecto
- `githubLink`: (opcional) Enlace a GitHub
- `liveDemoLink`: (opcional) Enlace a demo en vivo

### Restricciones de archivos:
- Tipos permitidos: Solo imágenes (image/*)
- Tamaño máximo: 5MB
- Storage: Las imágenes se almacenan en Supabase Storage bucket "Images"

## Autenticación

Para acceder a las rutas privadas, debes incluir el token de acceso en el header `Authorization`:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Flujo de autenticación:

1. **Login**: Usar la ruta pública de login para iniciar sesión con credenciales existentes
2. **Obtener token**: Supabase devuelve un `access_token` en la respuesta
3. **Registrar usuarios**: Solo usuarios autenticados pueden registrar nuevos usuarios
4. **Usar token**: Incluir el token en todas las peticiones a rutas privadas
5. **Renovar token**: Usar el `refresh_token` cuando el `access_token` expire

### Ejemplo de uso:

```javascript
// Login (única ruta pública para usuarios)
const loginResponse = await fetch('/api/users/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'admin@ejemplo.com',
    password: 'admin_password'
  })
});

const { data } = await loginResponse.json();
const accessToken = data.session.access_token;

// Registrar nuevo usuario (requiere autenticación)
const registerResponse = await fetch('/api/users/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    email: 'nuevo_usuario@ejemplo.com',
    password: 'nueva_password'
  })
});

// Usar token en otras rutas privadas
const projectResponse = await fetch('/api/projects/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    title: 'Mi Proyecto',
    description: 'Descripción del proyecto',
    imageSrc: 'https://ejemplo.com/imagen.jpg',
    githubLink: 'https://github.com/usuario/proyecto',
    liveDemoLink: 'https://mi-proyecto.com'
  })
});

// Crear proyecto con subida de archivo
const formData = new FormData();
formData.append('image', fileInput.files[0]); // archivo de imagen
formData.append('title', 'Mi Proyecto');
formData.append('description', 'Descripción del proyecto');
formData.append('githubLink', 'https://github.com/usuario/proyecto');
formData.append('liveDemoLink', 'https://mi-proyecto.com');

const projectWithFileResponse = await fetch('/api/projects/create', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
    // No incluir Content-Type, el navegador lo establece automáticamente para FormData
  },
  body: formData
});
```

## Respuestas de Error

### 401 Unauthorized
- Token faltante o inválido
- Token expirado

### 400 Bad Request
- Datos faltantes o inválidos en la petición

### 500 Internal Server Error
- Error del servidor o base de datos

## Middleware de Autenticación

El middleware `authenticateUser` verifica automáticamente:
- Presencia del header Authorization
- Formato correcto del token (Bearer)
- Validez del token con Supabase
- Información del usuario autenticado

El usuario autenticado está disponible en `req.user` en los controladores.
