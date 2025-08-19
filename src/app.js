import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import dotenv from 'dotenv';

// Importar rutas
import usersRouter from './routes/userRoutes.js';
import profilesRouter from './routes/profileRoutes.js'
import projectsRouter from './routes/projectsRoutes.js';

// Importar middleware personalizado
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';
import { 
  sanitizeForSQL, 
  preventXSS, 
  preventHPP, 
  securityLogger,
  additionalSecurityHeaders,
  validatePostgreSQLInput
} from './middleware/securityMiddleware.js';

dotenv.config();

const app = express();

// Trust proxy (importante para rate limiting y logs correctos)
app.set('trust proxy', 1);

// Middleware de seguridad y compresión
app.use(additionalSecurityHeaders);
app.use(helmet({
  contentSecurityPolicy: false, // Ya lo manejamos en additionalSecurityHeaders
  crossOriginEmbedderPolicy: false
}));
app.use(compression());

// Rate limiting mejorado
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite por IP
  message: {
    error: 'Demasiadas solicitudes',
    message: 'Has excedido el límite de solicitudes. Intenta de nuevo más tarde.',
    retryAfter: 15 * 60 // 15 minutos en segundos
  },
  standardHeaders: true, // Devolver rate limit info en headers `RateLimit-*`
  legacyHeaders: false, // Desactivar headers `X-RateLimit-*`
  skip: (req) => {
    // Saltar rate limiting para health check
    return req.path === '/health';
  }
});

// Logging y middleware básico
app.use(morgan('combined'));
app.use(limiter);
app.use(securityLogger);

// CORS con configuración específica
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Parsers con límites de seguridad
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Middleware de seguridad para sanitización (específico para PostgreSQL)
app.use(sanitizeForSQL);
app.use(validatePostgreSQLInput);
app.use(preventXSS);
app.use(preventHPP);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    message: 'API funcionando correctamente',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      profiles: '/api/profiles',
      projects: '/api/projects',
      health: '/health'
    }
  });
});

// API Routes
app.use('/api/users', usersRouter);
app.use('/api/profiles', profilesRouter);
app.use('/api/projects', projectsRouter);

// Manejo de errores
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
