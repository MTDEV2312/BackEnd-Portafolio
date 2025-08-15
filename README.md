# 🚀 Backend API - Portfolio Personal

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21+-blue.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green.svg)](https://supabase.com/)
[![Security](https://img.shields.io/badge/Security-Grade%20A-brightgreen.svg)](#security)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

> API REST robusta y segura desarrollada con Node.js, Express y PostgreSQL para gestionar un portfolio personal con autenticación, perfiles y proyectos.

## 📋 Tabla de Contenidos

- [🎯 Características](#-características)
- [🛠️ Tecnologías](#️-tecnologías)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [⚡ Instalación Rápida](#-instalación-rápida)
- [🔧 Configuración](#-configuración)
- [🚀 Uso](#-uso)
- [📖 Documentación de la API](#-documentación-de-la-api)
- [🛡️ Seguridad](#️-seguridad)
- [🧪 Testing](#-testing)
- [📊 Monitoreo](#-monitoreo)
- [🔄 Contribución](#-contribución)
- [📝 Licencia](#-licencia)

## 🎯 Características

### ✨ Funcionalidades Principales
- **👤 Autenticación JWT** - Sistema seguro con Supabase
- **📝 Gestión de Perfiles** - CRUD completo de información personal
- **💼 Gestión de Proyectos** - Portafolio de proyectos dinámico
- **🔐 Autorización por Roles** - Control granular de permisos
- **📊 Audit Logging** - Registro completo de operaciones

### 🛡️ Seguridad Avanzada
- **Rate Limiting** - Protección contra ataques de fuerza bruta
- **Validación Robusta** - Joi para validación de esquemas
- **Sanitización SQL** - Protección contra inyección SQL
- **Headers de Seguridad** - Helmet + headers personalizados
- **XSS Protection** - Sanitización contra cross-site scripting
- **CORS Configurado** - Control de origen cruzado

### ⚡ Performance y Calidad
- **Compresión Gzip** - Respuestas comprimidas automáticamente
- **Manejo de Errores** - Sistema robusto de manejo de errores
- **Logging Estructurado** - Morgan + logs personalizados
- **Testing Automatizado** - Suite completa de tests
- **ES Modules** - Sintaxis moderna de JavaScript

## 🛠️ Tecnologías

### Backend Stack
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | 18+ | Runtime de JavaScript |
| **Express** | 4.21+ | Framework web |
| **PostgreSQL** | 15+ | Base de datos relacional |
| **Supabase** | Latest | Backend-as-a-Service |

### Seguridad
| Paquete | Versión | Función |
|---------|---------|---------|
| **Helmet** | 8.1+ | Headers de seguridad |
| **Joi** | 18+ | Validación de esquemas |
| **XSS** | 1.0+ | Protección XSS |
| **HPP** | 0.2+ | Parameter pollution |
| **Express Rate Limit** | 8.0+ | Rate limiting |

### Desarrollo y Testing
| Herramienta | Versión | Uso |
|-------------|---------|-----|
| **Jest** | 30+ | Framework de testing |
| **Supertest** | 7.1+ | Testing de APIs |
| **Nodemon** | 3.1+ | Desarrollo en caliente |
| **Cross-env** | 10+ | Variables de entorno |

## 📁 Estructura del Proyecto

```
backend/
├── 📂 src/                    # Código fuente
│   ├── 📂 controllers/        # Lógica de controladores
│   │   ├── userController.js      # Gestión de usuarios
│   │   ├── profileController.js   # Gestión de perfiles
│   │   └── projectController.js   # Gestión de proyectos
│   ├── 📂 middleware/         # Middleware personalizado
│   │   ├── authMiddleware.js       # Autenticación
│   │   ├── validationMiddleware.js # Validación de datos
│   │   ├── errorMiddleware.js      # Manejo de errores
│   │   ├── securityMiddleware.js   # Seguridad general
│   │   └── supabaseSecurityMiddleware.js # Seguridad Supabase
│   ├── 📂 routes/             # Definición de rutas
│   │   ├── userRoutes.js          # Rutas de usuarios
│   │   ├── profileRoutes.js       # Rutas de perfiles
│   │   └── projectsRoutes.js      # Rutas de proyectos
│   ├── 📂 services/           # Lógica de servicios
│   │   └── services.js            # Servicios de Supabase
│   ├── 📂 models/             # Modelos de datos
│   │   └── Schemas.js             # Esquemas de validación
│   ├── 📂 config/             # Configuraciones
│   │   └── config.js              # Configuración de Supabase
│   ├── 📂 utils/              # Utilidades (vacío)
│   └── app.js                 # Configuración de Express
├── 📂 tests/                  # Tests automatizados
│   ├── setup.js                   # Configuración de tests
│   ├── app.test.js               # Tests de aplicación
│   └── security.test.js          # Tests de seguridad
├── 📄 server.js               # Punto de entrada
├── 📄 package.json            # Dependencias y scripts
├── 📄 jest.config.json        # Configuración de Jest
├── 📄 .env.example            # Variables de entorno ejemplo
├── 📄 .gitignore              # Archivos ignorados por Git
├── 📄 README.md               # Este archivo
├── 📄 API_DOCS.md             # Documentación de la API
├── 📄 SECURITY.md             # Guía de seguridad
└── 📄 POSTGRESQL_SECURITY.md  # Seguridad PostgreSQL específica
```

## ⚡ Instalación Rápida

### Prerrequisitos
- **Node.js** 18 o superior
- **npm** o **yarn**
- **Git**
- Cuenta en **Supabase**

### 1. Clonar el Repositorio
```bash
git clone https://github.com/MTDEV2312/BackEnd-Portafolio.git
cd BackEnd-Portafolio
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
```bash
cp .env.example .env
```

### 4. Configurar Supabase
Edita el archivo `.env` con tus credenciales:
```env
SUPABASE_URL=tu_url_de_supabase
SUPABASE_ANON_KEY=tu_clave_anonima
```

### 5. Ejecutar la Aplicación
```bash
# Desarrollo
npm run dev

# Producción
npm run prod
```

## 🔧 Configuración

### Variables de Entorno

| Variable | Descripción | Valor por Defecto | Requerido |
|----------|-------------|------------------|-----------|
| `PORT` | Puerto del servidor | `3000` | No |
| `NODE_ENV` | Entorno de ejecución | `development` | No |
| `FRONTEND_URL` | URL del frontend (CORS) | `http://localhost:3000` | Sí |
| `SUPABASE_URL` | URL de Supabase | - | Sí |
| `SUPABASE_ANON_KEY` | Clave anónima de Supabase | - | Sí |
| `RATE_LIMIT_WINDOW_MS` | Ventana de rate limit | `900000` | No |
| `RATE_LIMIT_MAX_REQUESTS` | Máx. requests por ventana | `100` | No |

### Configuración de Supabase

#### 1. Crear Tablas
```sql
-- Tabla de presentador (perfil)
CREATE TABLE presentador (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  perfil_url TEXT NOT NULL,
  about_me_description TEXT NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de proyectos
CREATE TABLE proyectos (
  id BIGSERIAL PRIMARY KEY,
  image_src TEXT NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  github_link TEXT,
  live_demo_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. Configurar RLS (Row Level Security)
```sql
-- Habilitar RLS
ALTER TABLE presentador ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
CREATE POLICY "Public read access" ON proyectos FOR SELECT USING (true);
CREATE POLICY "Authenticated write access" ON proyectos FOR ALL USING (auth.role() = 'authenticated');
```

## 🚀 Uso

### Scripts Disponibles

```bash
# Desarrollo con hot reload
npm run dev

# Producción
npm run prod

# Tests
npm test                    # Ejecutar todos los tests
npm run test:watch         # Tests en modo watch
npm run test:coverage      # Tests con cobertura

# Auditoría de seguridad
npm run security-audit     # Auditar dependencias
```

### Endpoints Principales

#### 🏠 Salud del Sistema
```bash
GET /health              # Estado del servidor
GET /                    # Información de la API
```

#### 👤 Autenticación
```bash
POST /api/users/login    # Iniciar sesión
POST /api/users/register # Registrar usuario (requiere auth)
POST /api/users/logout   # Cerrar sesión (requiere auth)
```

#### 📝 Perfiles
```bash
GET  /api/profiles/read   # Obtener perfil público
POST /api/profiles/create # Crear/actualizar perfil (requiere auth)
```

#### 💼 Proyectos
```bash
GET    /api/projects/read      # Listar proyectos públicos
POST   /api/projects/create    # Crear proyecto (requiere auth)
PATCH  /api/projects/update/:id # Actualizar proyecto (requiere auth)
DELETE /api/projects/delete/:id # Eliminar proyecto (requiere auth)
```

## 📖 Documentación de la API

### Autenticación

Todas las rutas privadas requieren un token JWT en el header:
```http
Authorization: Bearer <token>
```

### Ejemplos de Uso

#### Crear un Proyecto
```bash
curl -X POST http://localhost:3000/api/projects/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Mi Proyecto",
    "description": "Descripción del proyecto",
    "imageSrc": "https://example.com/image.jpg",
    "githubLink": "https://github.com/user/repo",
    "liveDemoLink": "https://project.com"
  }'
```

#### Obtener Proyectos
```bash
curl http://localhost:3000/api/projects/read
```

### Códigos de Respuesta

| Código | Significado | Descripción |
|--------|-------------|-------------|
| `200` | OK | Solicitud exitosa |
| `201` | Created | Recurso creado exitosamente |
| `400` | Bad Request | Datos de entrada inválidos |
| `401` | Unauthorized | Token requerido o inválido |
| `403` | Forbidden | Permisos insuficientes |
| `404` | Not Found | Recurso no encontrado |
| `413` | Payload Too Large | Archivo demasiado grande |
| `429` | Too Many Requests | Rate limit excedido |
| `500` | Internal Server Error | Error interno del servidor |

### Estándares de Código

- **ES Modules** (import/export)
- **Async/Await** para operaciones asíncronas
- **Error handling** robusto
- **Validación** de datos de entrada
- **Logging** estructurado
- **Tests** para nuevas funcionalidades
