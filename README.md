# API Backend - Node.js + Express

Una API REST desarrollada con Node.js y Express con las mejores prácticas de seguridad y estructura.

## 🚀 Características

- **Express.js** - Framework web rápido y minimalista
- **CORS** - Configuración de Cross-Origin Resource Sharing
- **Helmet** - Middleware de seguridad
- **Morgan** - Logger de peticiones HTTP
- **Rate Limiting** - Limitación de peticiones por IP
- **Variables de entorno** - Configuración con dotenv
- **Nodemon** - Reinicio automático en desarrollo

## 📁 Estructura del proyecto

```
backend/
├── src/
│   ├── controllers/     # Lógica de controladores
│   ├── routes/         # Definición de rutas
│   ├── middleware/     # Middleware personalizado
│   ├── models/         # Modelos de datos
│   ├── services/       # Lógica de servicios
│   ├── utils/          # Utilidades
│   ├── config/         # Configuraciones
│   └── app.js          # Configuración de Express
├── server.js           # Punto de entrada
├── .env                # Variables de entorno
├── .env.example        # Ejemplo de variables de entorno
└── package.json        # Dependencias y scripts
```

## 🛠️ Instalación y configuración

1. **Clonar el repositorio**
   ```bash
   git clone <tu-repositorio>
   cd backend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

4. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

## 📜 Scripts disponibles

- `npm start` - Ejecutar en producción
- `npm run dev` - Ejecutar en desarrollo (con nodemon)
- `npm run prod` - Ejecutar en modo producción
- `npm test` - Ejecutar tests (por configurar)

## 🌐 Endpoints disponibles

### General
- `GET /` - Estado de la API

### Autenticación (`/api/auth`)
- `GET /api/auth/status` - Estado del servicio de autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/logout` - Cerrar sesión

### Usuarios (`/api/users`)
- `GET /api/users` - Obtener todos los usuarios
- `GET /api/users/:id` - Obtener usuario por ID
- `POST /api/users` - Crear nuevo usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

## 🔧 Configuración

### Variables de entorno requeridas

```env
PORT=3000
NODE_ENV=development
```

### Variables de entorno opcionales

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=api_database
DB_USER=api_user
DB_PASSWORD=your_password

# JWT
JWT_SECRET=tu_clave_secreta_super_segura_aqui
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3001
```

## 🔒 Seguridad

- **Helmet** - Configura headers de seguridad
- **Rate Limiting** - 100 peticiones por IP cada 15 minutos
- **CORS** - Configurado para desarrollo
- **Validación** - Validación básica de entrada en controladores

## 🧪 Testing

```bash
# Ejecutar tests (por implementar)
npm test
```

## 📦 Dependencias principales

- express: Framework web
- cors: Configuración CORS
- helmet: Middleware de seguridad
- morgan: Logger de peticiones
- express-rate-limit: Limitación de peticiones
- dotenv: Variables de entorno

## 🔄 Próximos pasos

- [ ] Implementar base de datos (MongoDB/PostgreSQL)
- [ ] Añadir autenticación JWT real
- [ ] Implementar tests unitarios
- [ ] Añadir validación con Joi o similar
- [ ] Configurar logging avanzado
- [ ] Añadir documentación con Swagger
- [ ] Implementar middleware de autenticación
- [ ] Configurar CI/CD

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia ISC.
# BackEnd-Portafolio
